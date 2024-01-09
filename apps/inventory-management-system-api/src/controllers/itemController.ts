import { Request as ExpressRequest, Response } from 'express';
import Item from '../models/itemModel';

export interface RequestWithUser extends ExpressRequest {
  user: {
    _id: string;
    // any other fields that you expect to be in `req.user`
  };
}

// GET all items
export async function getItems(req: RequestWithUser, res: Response): Promise<void> {
  console.log('getItems called');
  try {
    console.log('Inside getItems');
    const items = await Item.find();
    console.log('Items:', items); // Debugging line
    res.json(items);
  } catch (error) {
    console.log('Error:', error); // Debugging line
    res.status(500).send({ message: 'Error fetching items' });
  }
}

export async function postItem(req: RequestWithUser, res: Response): Promise<void> {
  try {
    console.log("Received data:", req.body);
    // If you were using authentication
     const userId = req.user?._id;

    // Create a new item based on the model
    const newItem = new Item(req.body);

    // Save the item
    await newItem.save();

    // Send back the newly created item
    res.json(newItem);

  } catch (error) {
    console.error('Error:', error);  // Debugging line
    res.status(500).send({ message: 'Error adding item' });
  }
}
