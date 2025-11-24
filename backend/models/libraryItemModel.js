const mongoose = require('mongoose');

const libraryItemSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Por favor, añade un título'],
        },
        summary: {
            type: String,
        },
        tags: [{
            type: String,
        }],
        link: {
            type: String,
            required: true,
        },
        itemType: {
            type: String,
            required: true,
            enum: ['link', 'pdf'],
        },
        resultId: {
            type: String, 
        }
    },
    {
        timestamps: true,
    }
);

libraryItemSchema.index(
    { user: 1, resultId: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { resultId: { $ne: null } } 
    }
);

// Índices para búsquedas y orden por fechas
libraryItemSchema.index({ user: 1, createdAt: -1 });
libraryItemSchema.index({ user: 1, title: 1 });
// Búsqueda textual básica sobre título y resumen
// index de texto: incluir 'tags' también como campo textual (permite arrays)
libraryItemSchema.index({ title: 'text', summary: 'text', tags: 'text' });

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
