import User from '../models/User_Model.js';
import {userCreatedEvent} from '../services/rabbitServicesEvent.js';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

export const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('error al enlistar los usuarios: ', error);
        res.status(500)
            .json({message: 'error al obtener los usuarios'});
    }
};

export const PostUsers = async (req, res) => {
    let { userName, phone, password } = req.body;

    try {
        // Verificar si el userName (correo) y phone están presentes
        if (!userName || !phone) {
            return res.status(400).json({ message: 'Los campos user (correo) y phone son obligatorios' });
        }

        // Validar si el userName cumple con el formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userName)) {
            return res.status(400).json({ message: 'El campo user debe ser un correo electrónico válido' });
        }
        // Verificar si el correo o teléfono ya existen
        /* const existU = await User.findOne({ where: { userName } });
        const existP = await User.findOne({ where: { phone } });

        if (existU || existP) {
            return res.status(400).json({ message: 'El correo o teléfono ya existe' });
        } */

        // Crear el nuevo usuario sin asignar la contraseña
        const newUser = await User.create({
            id: null,
            userName,
            phone,
            password,
            status: true,
            creationDate: new Date(),
        });

        // Llamar a la función para emitir el evento de creación de usuario
        await userCreatedEvent(newUser);

        return res.status(201).json({ message: "Usuario creado", Data: newUser });
    } catch (error) {
        console.error('Error al agregar el usuario: ', error);
        return res.status(500).json({ message: 'Error al agregar el usuario' });
    }
};



export const UpdateUser = async (req, res) => {
    const { id } = req.params;
    const { password, phone } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Validaciones de longitud
        if (phone && phone.length !== 10) {
            return res.status(400).json({ message: 'El campo phone debe tener 10 dígitos' });
        }
        if (password && password.length !== 8) {
            return res.status(400).json({ message: 'El campo password debe tener 8 caracteres' });
        }

        // Verificar si el phone ya existe en otro usuario
        if (phone) {
            const existP = await User.findOne({ where: { phone } });
            if (existP && existP.id !== user.id) {
                return res.status(400).json({ message: 'El campo phone ya está en uso' });
            }
        }

        await user.update({
            password: password || user.password,
            phone: phone || user.phone,
        });

        return res.status(200).json({ message: "Usuario actualizado", data: user });

    } catch (error) {
        console.error('Error al modificar: ', error);
        return res.status(500).json({ message: 'Error al modificar' });
    }
};

export const DeleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }
        await user.update({
            status: false
        });
        return res.status(200).json({ message: "Usuario eliminado", data: user });
    } catch (error) {
        console.error('Error al modificar: ', error);
        return res.status(500).json({ message: 'Error al modificar' });
    }
}



export const login = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const KEY = process.env.SECRET_KEY;

        const user = await User.findOne({ where: { userName, password } });


        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.userName },
            KEY,
            { expiresIn: "1h" }
        );

        return res.status(200).json({ message: 'Login exitoso', token });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
};

export const PasswordToken = async (req, res) => {
    const { userName } = req.body;
    
    try {
        // Verificar si el usuario existe
        const user = await User.findOne({ where: { userName } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Generar un token de recuperación con un tiempo de expiración de 1 hora
        const resetToken = jwt.sign(
            { id: user.id, userName: user.userName },
            process.env.SECRET_KEY,
            { expiresIn: '1h' }
        );

        // Aquí podrías enviar el token por email o algún otro medio
        return res.status(200).json({
            message: 'Token de recuperación generado exitosamente',
            resetToken
        });
    } catch (error) {
        console.error('Error al generar el token de recuperación:', error);
        return res.status(500).json({ message: 'Error al generar el token' });
    }
};

