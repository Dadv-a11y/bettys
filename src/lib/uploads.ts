import 'server-only';
import path from 'path';
export const uploadDir = () => path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? './uploads');
export const uploadFile = (name: string) => path.join(/* turbopackIgnore: true */ uploadDir(), name);
