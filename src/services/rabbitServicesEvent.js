import amqp from "amqplib";
import dotenv from 'dotenv';
import User from '../models/User_Model.js'; 

dotenv.config();

const RABBITMQ_URL = process.env.RABBIT_HOST;
const RABBIT_EXCHANGE = "user_event";
const RABBIT_ROUTING_KEY = "user.created";

const RABBIT_EXCHANGE_CLIENT = "client_event";
const RABBIT_ROUTING_KEY_CLIENT = "client.created";
const QUEUE_NAME = "user_client_queue";

const RABBIT_EXCHANGE_PASS = "password_reset_event";
const RABBIT_ROUTING_KEY_PASS = "password.reset";

// Función para enviar un evento de creación de usuario
export async function userCreatedEvent(user) {
    const connection = await amqp.connect("amqps://pslngtxw:EDquSCxlGIqU_KZPi_eK09fTs433-0Qz@beaver.rmq.cloudamqp.com/pslngtxw");
    const channel = await connection.createChannel();

    await channel.assertExchange(RABBIT_EXCHANGE, "topic", { durable: true });

    const message = JSON.stringify(user);
    channel.publish(RABBIT_EXCHANGE, RABBIT_ROUTING_KEY, Buffer.from(message));

    console.log(`exchange ${RABBIT_EXCHANGE}, routing key "${RABBIT_ROUTING_KEY}" : ${message}`);
    
    setTimeout(() => {
        connection.close()
    }, 500);
}

// Escucha el evento de cliente creado
async function startClientEventListener() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBIT_EXCHANGE_CLIENT, "topic", { durable: true });
        const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

        await channel.bindQueue(q.queue, RABBIT_EXCHANGE_CLIENT, RABBIT_ROUTING_KEY_CLIENT);

        console.log(`🔄 Escuchando eventos de clientes en la cola: ${QUEUE_NAME}...`);

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const clientData = JSON.parse(msg.content.toString());
                console.log("📥 Cliente recibido en user service:", clientData);

                // Verifica si es un cliente y asigna la contraseña por defecto
                if (clientData) {
                    // Asignar una contraseña por defecto (en este caso "1234")
                    const defaultPassword = '1234';

                    // Crear el usuario con la contraseña por defecto
                    const newUser = await User.create({
                        id: null,
                        userName: clientData.Correo,
                        password: defaultPassword,
                        phone: clientData.Telefono,
                        status: true,
                        creationDate: new Date(),
                    });

                    console.log(`Usuario creado para el cliente: ${clientData.Correo}`);

                    // Ahora envía un evento de usuario creado
                    await userCreatedEvent(newUser);
                }

                channel.ack(msg); // Confirmamos que el mensaje fue recibido
            }
        });

    } catch (error) {
        console.error("❌ Error al escuchar eventos de clientes:", error);
    }
}

// Función para enviar un evento de recuperación de contraseña con el token
export async function sendPasswordResetEvent(user, resetToken) {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
            port: 5672,
            username: process.env.RABBITMQ_USER || 'user',
            password: process.env.RABBITMQ_PASS || 'password'
        });
        const channel = await connection.createChannel();

        await channel.assertExchange(RABBIT_EXCHANGE_PASS, "topic", { durable: true });

        // Crear el mensaje con el token de recuperación
        const message = JSON.stringify({
            userId: user.id,
            userName: user.userName,
            resetToken: resetToken
        });

        channel.publish(RABBIT_EXCHANGE_PASS, RABBIT_ROUTING_KEY_PASS, Buffer.from(message));

        console.log(`exchange ${RABBIT_EXCHANGE_PASS}, routing key "${RABBIT_ROUTING_KEY_PASS}" : ${message}`);
        
        setTimeout(() => {
            connection.close();
        }, 500);
    } catch (error) {
        console.error('Error al enviar el evento de recuperación de contraseña:', error);
    }
}

// Iniciar el listener al arrancar el servicio
startClientEventListener();
