import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

console.log('🚀 main.ts chargé - Démarrage de l\'application...');

bootstrapApplication(App, appConfig)
  .then(() => console.log('✅ Application Angular démarrée avec succès'))
  .catch((err) => {
    console.error('❌ Erreur au démarrage Angular:', err);
    alert('Erreur: ' + err.message);
  });
