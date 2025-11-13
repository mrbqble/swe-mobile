// Simple mock auth adapter for consumer registration
import emitter from '../helpers/events';

type Consumer = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const consumers: Consumer[] = [];

function makeId() {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1_000_000).toString(36)}`;
}

export async function registerConsumer(payload: { firstName?: string; lastName?: string; email: string; password: string }) {
  // Very small validation mimic
  if (!payload.firstName || !payload.lastName || !payload.email || !payload.password) {
    const err: any = new Error('Missing fields');
    err.status = 400;
    throw err;
  }

  // Check duplicate email in mock store
  const exists = consumers.find((c) => c.email.toLowerCase() === payload.email.toLowerCase());
  if (exists) {
    const err: any = new Error('Email already exists');
    err.status = 409;
    throw err;
  }

  const newConsumer: Consumer = {
    id: makeId(),
    name: `${payload.firstName} ${payload.lastName}`,
    email: payload.email,
    createdAt: new Date().toISOString(),
  };
  consumers.push(newConsumer);

  // emit an event in case other parts of the mock app want to react
  emitter.emit('consumersChanged');

  // Return a minimal auth response (token omitted in mock)
  return { user: newConsumer };
}

export async function listConsumers() {
  return consumers.slice();
}
