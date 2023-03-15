const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  // find all categories
  // be sure to include its associated Products
  const findTagsWithProductData = async (req, res) => {
    try {
      const tags = await Tag.findAll({
        include: {
          model: Product,
          attributes: ['product_name', 'price', 'stock', 'category_id']
        }
      });
      res.json(tags);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  };
  
  // call the function to execute the query
  findTagsWithProductData();
});

router.get('/:id', (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  const findTagByIdWithProductData = async (req, res) => {
    const tagId = req.params.id;
    try {
      const tag = await Tag.findOne({
        where: { id: tagId },
        include: {
          model: Product,
          attributes: ['product_name', 'price', 'stock', 'category_id']
        }
      });
      if (!tag) {
        res.status(404).json({ message: 'Tag not found' });
      } else {
        res.json(tag);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  };
  
  // call the function to execute the query
  findTagByIdWithProductData(req, res);
});

router.post('/', (req, res) => {
  // create a new category
  const createNewTag = async (req, res) => {
    const { tag_name } = req.body;
    try {
      const newTag = await Tag.create({ tag_name });
      res.status(201).json(newTag);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  };
  
  // call the function to execute the query
  createNewTag(req, res);
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  const updateTagById = async (req, res) => {
    const tagId = req.params.id;
    try {
      const [rowsAffected, [updatedTag]] = await Tag.update(req.body, {
        where: { id: tagId },
        returning: true,
      });
      if (rowsAffected === 0) {
        res.status(404).json({ message: 'Tag not found' });
      } else {
        res.json(updatedTag);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  };
  
  // call the function to execute the query
  updateTagById(req, res);
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  const deleteTagById = async (req, res) => {
    const tagId = req.params.id;
    try {
      const rowsAffected = await Tag.destroy({
        where: { id: tagId },
      });
      if (rowsAffected === 0) {
        res.status(404).json({ message: 'Tag not found' });
      } else {
        res.json({ message: 'Tag deleted successfully' });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  };
  
  // call the function to execute the query
  deleteTagById(req, res);
});

module.exports = router;
