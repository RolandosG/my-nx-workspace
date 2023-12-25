import { Request, Response } from 'express';
import { Collection, InsertOneResult, WithId } from 'mongodb';

// Define a type for your character, assuming it has a name and level
interface Character {
  name: string;
  level?: number;
  userId?: string;
}

// A global variable holding the MongoDB collection
let charactersCollection: Collection;

// Function to set the MongoDB collection
export const setCharacterCollection = (collection: Collection) => {
  charactersCollection = collection;
};

// Function to get characters
export const getCharacters = async (_req: Request, res: Response) => {
  try {
    const characters = await charactersCollection.find({}).toArray();
    res.json(characters);
  } catch (error) {
    res.status(500).send({ message: 'Error fetching characters' });
  }
};

// Function to add a new character
export const addCharacter = async (req: Request, res: Response) => {
  try {
    const newCharacter: Character = req.body;
    const result: InsertOneResult<WithId<Character>> = await charactersCollection.insertOne(newCharacter);
    res.status(201).send({ message: 'Character added successfully', id: result.insertedId });
  } catch (error) {
    res.status(500).send({ message: 'Error adding character' });
  }
};

// You can add more methods here for updating, deleting, etc.
