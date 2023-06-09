const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  const getAllProducts = async () => {
    try {
      const products = await Product.findAll({
        attributes: ['id', 'product_name', 'price', 'stock'],
        include: [
          {
            model: Category,
            attributes: ['category_name']
          },
          {
            model: Tag,
            attributes: ['tag_name']
          }
        ]
      });
  
      return products;
    } catch (error) {
      console.log(error);
      throw new Error('Unable to get products.');
    }
  };
  
  app.get('/products', async (req, res) => {
    try {
      const products = await getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  const getProductById = async (id) => {
    try {
      const product = await Product.findOne({
        where: {
          id
        },
        attributes: ['id', 'product_name', 'price', 'stock'],
        include: [
          {
            model: Category,
            attributes: ['category_name']
          },
          {
            model: Tag,
            attributes: ['tag_name']
          }
        ]
      });
  
      if (!product) {
        throw new Error('No product found with this id');
      }
  
      return product;
    } catch (error) {
      throw new Error('Unable to get product.');
    }
  };
  
  app.get('/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await getProductById(id);
  
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
});

// create new product
router.post('/', (req, res) => {
  const createProduct = async (productData) => {
    try {
      const product = await Product.create({
        product_name: productData.product_name,
        price: productData.price,
        stock: productData.stock,
        category_id: productData.category_id,
        tagIds: productData.tagIds
      });
  
      return product;
    } catch (error) {
      throw new Error('Unable to create product.');
    }
  };
  
  app.post('/products', async (req, res) => {
    try {
      const product = await createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  const deleteProductById = async (id) => {
    try {
      const product = await Product.destroy({
        where: {
          id
        }
      });
  
      if (!product) {
        throw new Error('No product found with this id');
      }
  
      return product;
    } catch (error) {
      throw new Error('Unable to delete product.');
    }
  };
  
  app.delete('/products/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const product = await deleteProductById(id);
  
      res.status(200).json(product);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  });
});

module.exports = router;
