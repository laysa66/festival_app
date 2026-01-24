import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// fonction pour hasher le mot de passe avant de le stocker dans la base de donnees
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};


// fonction pour comparer le mot de passe en clair avec le hash stocke dans la base de donnees
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
