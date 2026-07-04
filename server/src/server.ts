import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg'; 

const pool = new Pool({
  user: 'admin',
  host: '127.0.0.1', 
  database: 'mesh_network',
  password: 'secretpassword', 
  port: 5432,
  max: 10,
});

const server: FastifyInstance = Fastify({ logger: true });

server.register(cors, { origin: '*' });

server.post('/api/emergency', async (request, reply) => {
  try {
    const payload: any = request.body;
    server.log.info('Received data from Frontend:', payload);

    const query = `
      INSERT INTO emergencies (id, type_id, latitude, longitude, message)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [payload.i, payload.t, payload.a, payload.o, payload.m];

    const result = await pool.query(query, values);
    server.log.info('Saved to Database:', result.rows[0]);

    return reply.status(200).send({
      success: true,
      message: 'Emergency data saved to Database successfully!',
      data: result.rows[0] 
    });

  } catch (error) {
    server.log.error(error as Error,'Database Error:');
    return reply.status(500).send({ error: 'Internal Server Error' });
  }
});

const start = async () => {
  try {
    const client = await pool.connect();
    server.log.info('✅ Connected to PostgreSQL successfully!');
    client.release(); 

    await server.listen({ port: 3000, host: '0.0.0.0' });
    console.log(`🚀 Server is running on http://localhost:3000`);
  } catch (err) {
    server.log.error(err);
    process.exit(1); 
  }
};

start();