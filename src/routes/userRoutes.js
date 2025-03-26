import express from 'express';
import { DeleteUser, getUsers, PostUsers, UpdateUser, login, PasswordToken } from '../controllers/user_Controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Users
 *     description: The users managing API
 */

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Get all users
 *     tags: 
 *       - Users
 *     responses:
 *       '200':
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   status:
 *                     type: boolean
 */
router.get('/', getUsers);

router.post('/login',login);
/**
 * @swagger
 * /api/users/create:
 *   post:
 *     summary: Create a new user
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userName:
 *                       type: string
 *                     phone:
 *                       type: string
 */
router.post('/create', PostUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User updated successfully
 */
router.patch('/:id', UpdateUser);

/**
 * @swagger
 * /api/users/delete/{id}:
 *   put:
 *     summary: Delete a user
 *     tags: 
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       '200':
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 */
router.put('/delete/:id', DeleteUser);

router.post('/pass/:id', PasswordToken);

export default router;
