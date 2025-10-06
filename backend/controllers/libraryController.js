// backend/controllers/libraryController.js
const asyncHandler = require('express-async-handler');
const { Dropbox } = require('dropbox');
const { Types } = require('mongoose');
const path = require('path');
const LibraryItem = require('../models/libraryItemModel');

// OBTENER ITEMS DE LA BIBLIOTECA PERSONAL (con búsqueda robusta)
const getLibraryItems = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('No autorizado');
  }

  const raw = (req.query?.search ?? '').toString();
  const search = raw.trim();

  const baseQuery = {
    user: Types.ObjectId.isValid(userId) ? new Types.ObjectId(userId) : userId,
  };

  const query = { ...baseQuery };

  if (search) {
    const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safe, 'i');
    query.$or = [
      { title: regex },
      { summary: regex },
      { tags: { $elemMatch: { $regex: regex } } },
    ];
  }

  const [libraryItems, totalForUser] = await Promise.all([
    LibraryItem.find(query).sort({ createdAt: -1 }),
    LibraryItem.countDocuments(baseQuery),
  ]);

  console.log(
    `[getLibraryItems] user=${userId} search="${search}" -> ${libraryItems.length} items (total user=${totalForUser})`
  );

  res.status(200).json(libraryItems);
});

// SUBIR UN NUEVO PDF A LA BIBLIOTECA PERSONAL
const uploadLibraryItem = asyncHandler(async (req, res) => {
  const { summary, tags, itemType } = req.body;
  let { title } = req.body;

  if (itemType === 'pdf') {
    if (!req.file) {
      res.status(400);
      throw new Error('No se ha subido ningún archivo PDF.');
    }
    if (!title) {
      title = path.parse(req.file.originalname).name;
    }

    const dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_TOKEN });
    const filePath = `/proyectifyia/${Date.now()}_${req.file.originalname}`;

    try {
      const uploadResponse = await dbx.filesUpload({
        path: filePath,
        contents: req.file.buffer,
      });

      const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadResponse.result.path_lower,
        settings: { requested_visibility: 'public' },
      });

      const viewableLink = sharedLinkResponse.result.url.replace('?dl=0', '?raw=1');

      const tagsArray = tags
        ? String(tags).split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const libraryItem = await LibraryItem.create({
        user: req.user.id,
        title,
        summary: summary || '',
        tags: tagsArray,
        itemType: 'pdf',
        link: viewableLink,
      });

      return res.status(201).json(libraryItem);
    } catch (error) {
      console.error('--- ERROR DETALLADO DE DROPBOX O DB ---', error);
      res.status(500);
      throw new Error('Error al subir el archivo. Revisa el token de Dropbox y la conexión a la DB.');
    }
  }

  res.status(400).json({ message: 'Tipo de item inválido o datos incorrectos.' });
});

// GUARDAR ARTÍCULO SUGERIDO A LA BIBLIOTECA PERSONAL
const saveSuggestedArticle = asyncHandler(async (req, res) => {
  const { title, link, summary, resultId } = req.body;
  if (!title || !link || !resultId) {
    res.status(400);
    throw new Error('Faltan datos del artículo.');
  }

  const alreadyExists = await LibraryItem.findOne({
    user: req.user.id,
    resultId,
  });
  if (alreadyExists) {
    res.status(409);
    throw new Error('Este artículo ya está en tu biblioteca.');
  }

  const libraryItem = await LibraryItem.create({
    user: req.user.id,
    title,
    link,
    summary,
    resultId,
    itemType: 'link',
  });

  res.status(201).json(libraryItem);
});

// ELIMINAR UN ITEM DE LA BIBLIOTECA PERSONAL
const deleteLibraryItem = asyncHandler(async (req, res) => {
  const item = await LibraryItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    throw new Error('Elemento no encontrado');
  }
  if (item.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Usuario no autorizado');
  }
  await item.deleteOne();
  res.status(200).json({ id: req.params.id });
});

module.exports = {
  getLibraryItems,
  uploadLibraryItem,
  deleteLibraryItem,
  saveSuggestedArticle,
};
