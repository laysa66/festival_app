### explication de partie f1 
on a un frontend en angular et un backend en nodejs +fastify et une base de donnée postgresql
fastisfy :je l'ai choisi a la place d'express car il est plus rapide et plus léger, IL ECOUTE LES DEMANDES HTTP,verfie que c valide, recharger les donnees dans postgres et renvoie une reponse avec du json  

##### mon objectif 1: 
- faire communiquer le frontend et le backend
- page de login (email, mot de passe)
- page d'inscription (nom, prenom, email, mot de passe, confirmation mot de passe)
- une fois connecté, rediriger vers une page d'accueil avec un message de bienvenue
- gérer les erreurs (email déjà utilisé, mot de passe incorrect, etc.)
- stocker les utilisateurs dans une base de données postgresql

#### la base de données + prisma :
- j'ai utiliser prisma, c'est comme un assistant, il va ecrire les requetes sql a ma place, verifie si les donnees sont correctes avec typescript, et creer les tables automatiquement , on peut le trouver les schemas Prisma dans le dossier backend/prisma/schema.prisma
- dedans y a une table user avec id, nom, prenom, email, mot de passe, createdAt et updatedAt
- donc on a les roles --- user , un user a un role 

- le seed permet d'ajouter a la base de donnees des donnees de test en harsh, on peut le trouver dans backend/prisma/seed.ts, j'ai ajouter un user admin par defaut, le but AVOIR DES DONNEES DE BASE AU DEMARRAGE
#### la creation de table : 
- pour creer les tables dans la base de donnee on utilise les commandes prisma
```bash
npx prisma generate  # genere le client typescript
npx prisma migrate dev   # creer les tables dans postgres
npx prisma db seed   # rempli la base de donnes avec les seeds
```

#### c'est quoi zod 
une librairie de validation de schema ttpescript, si email est valide tu passe sinon erreur, il valide automatiquement, et genere la doc swagger 


#### relation entre prisma et fastify: 

#### on doit creer maintenant l'api 
- on a un serveur web , qui recoit des requetes http, verifie les donnees , interroge la abse de donnees, et renvoies des reponses soit erreurs ou success ou autre 

##### EXAMPLE pour login, ce que j'ai fais : 
1- definir les donnees 

crrer l'interface du login , elle est dans auth.models.ts 

2- puisque on recoint de donnees on dit mainteannt les valider et pour cela on va utiliser zod ( direction auth.validators.ts)

3- passons a la logique metier les SERVICES , on doit creer un service d'authentification (auth.service.ts)

4- vous l'avez remarquez j'ai utiliser une fonctiontion comparepassword , cette fonction est decrite dans utils/password.util.ts , elle permet de comparer le mot de passe en clair avec le mot de passe hashé dans la base de données, donc le mot de passe n'est jamais stocké en clair, bycrypt utilise un algortihme one way ( vue l'anne derniere ) , et meme si un. utilisateur a le meme mot de passe que un autre, le hash sera different grace au salt

5- passons a la generation des jwt, avant c'est quoi un jwt ? ==> c'est un json web token , c'est un badge d'acces numeriques 
une partie est un header( c'est l'lagorithme utilisé ), l'autre c'est le payload ( tout les infos qu'on recuperer ) et a la fin y'a la signature ( pour verifier que le token n'a pas ete modifié )
notre payload a nous va ressembler a ceci 
```{
  "userId": 5,
  "email": "user@example.com",
  "role": "USER",
  "iat": 1732567890,  // Date de création
  "exp": 1733172690   // Date d'expiration (7 jours)
}
```
ce qui se passe , le backend signe le token avec une cle secrete( la plupart du temps elle est dans le .env), le frontend stock le token dan sun cookie, et maintenant le frontend envoie chaque reqyete avec le token, et le backend verfie la signature du token pour s'assurer que c'est valide et que c'est la sienne

5- maintenant on doit creer le controller d'authentification (auth.controller.ts) , le controller recoit les requetes http, il appelle les services pour faire la logique metier, et renvoie les reponses http, 
notre controller c'est ***auth.controller.ts*** 

6- enfin on doit definir la route, dans ***auth.routes.ts*** , on defini la route /login qui utilise la methode post et qui appelle la methode login du controller, donc on a une documentation automatique , validation automatique avec zod , et swagger pour documenter l'api
** c quoi un middleware ? **
c un videur de boite de nuit qui controle avant de laisser passer, notre middleware est dans ***auth.middleware.ts*** , il verifie que le token est present et valide avant de laisser passer a la route protegee
7- on connecte tout ensemble dans **app.ts**



### Passons au front 
- on cree une interface angular , lesdonnes sont envoyes au backend , les cookie automatiqument gere , et l'utilisateur sera rederigé vers le dashboard 

1- creer le service auth 
2- creer le composant login 
3- creer le template html 
4- proteger les routes dans auth.guard.ts 
5- vous poucez ajoutez les interceptor pour vous 