/**
 * Règles de sécurité Firestore pour les conversations et messages
 * À ajouter dans votre fichier firestore.rules
 */

/*
=== RÈGLES À AJOUTER DANS firestore.rules ===

// Conversations
match /conversations/{conversationId} {
  // Seuls les participants peuvent lire/écrire
  allow read, write: if isParticipant(conversationId, request.auth.uid);
  
  // Messages dans les conversations
  match /messages/{messageId} {
    // Seuls les participants peuvent lire les messages
    allow read: if isParticipant(conversationId, request.auth.uid);
    
    // Seuls les participants peuvent créer des messages
    allow create: if isParticipant(conversationId, request.auth.uid)
      && request.auth.uid == resource.data.senderId
      && validateMessage();
    
    // Seul l'auteur peut modifier ses messages (pour marquer comme lu/supprimé)
    allow update: if isParticipant(conversationId, request.auth.uid)
      && (request.auth.uid == resource.data.senderId 
          || request.auth.uid == resource.data.receiverId);
    
    // Seul l'auteur peut supprimer ses messages
    allow delete: if request.auth.uid == resource.data.senderId;
  }
}

// Fonctions helper
function isParticipant(conversationId, userId) {
  return exists(/databases/$(database)/documents/conversations/$(conversationId)) &&
    userId in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants[].id;
}

function validateMessage() {
  return request.resource.data.keys().hasAll(['senderId', 'receiverId', 'text', 'createdAt', 'status', 'bookingId'])
    && request.resource.data.senderId is string
    && request.resource.data.receiverId is string
    && request.resource.data.text is string
    && request.resource.data.text.size() <= 2000
    && request.resource.data.status in ['sent', 'delivered', 'read']
    && request.resource.data.createdAt == request.time
    && request.resource.data.flagged == false;
}

=== FIN DES RÈGLES ===
*/

// Ce fichier est à titre informatif uniquement
// Copiez les règles ci-dessus dans votre fichier firestore.rules