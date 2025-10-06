const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/userModel');

let mongoServer;

jest.setTimeout(20000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), { dbName: 'verifyMASTER' });
});

afterAll(async () => {
  try { await mongoose.disconnect(); } catch (e) {}
  try { if (mongoServer) await mongoServer.stop(); } catch (e) {}
});

afterEach(async () => {
  await User.deleteMany();
});

describe('User Model', () => {
  it('debería guardar un usuario válido', async () => {
    const user = new User({ name: 'Juan', email: 'juan@mail.com', password: '123456' });
    const savedUser = await user.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe('Juan');
    expect(savedUser.email).toBe('juan@mail.com');
  });

  it('debería requerir el campo nombre', async () => {
    const user = new User({ email: 'juan@mail.com', password: '123456' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it('debería requerir un email válido', async () => {
    const user = new User({ name: 'Juan', email: 'noemail', password: '123456' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('debería requerir el campo contraseña', async () => {
    const user = new User({ name: 'Juan', email: 'juan@mail.com' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('no debería permitir emails duplicados', async () => {
    const user1 = new User({ name: 'Juan', email: 'juan@mail.com', password: '123456' });
    const user2 = new User({ name: 'Pedro', email: 'juan@mail.com', password: 'abcdef' });
    await user1.save();
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.code).toBe(11000);
  });

  it('debería establecer timestamps automáticamente', async () => {
    const user = new User({ name: 'Ana', email: 'ana@mail.com', password: 'clave123' });
    const savedUser = await user.save();
    expect(savedUser.createdAt).toBeDefined();
    expect(savedUser.updatedAt).toBeDefined();
  });

  it('debería lanzar error si el email está vacío', async () => {
    const user = new User({ name: 'Luis', email: '', password: 'clave123' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('debería lanzar error si el nombre está vacío', async () => {
    const user = new User({ name: '', email: 'luis@mail.com', password: 'clave123' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
  });

  it('debería lanzar error si la contraseña está vacía', async () => {
    const user = new User({ name: 'Luis', email: 'luis@mail.com', password: '' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

});
