import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

type Data = {
    content: string;
} | {
    error: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const filePathQuery = req.query.path;

    if (typeof filePathQuery !== 'string' || !filePathQuery) {
        return res.status(400).json({ error: 'Missing or invalid "path" query parameter.' });
    }

    // Validação de segurança: garantir que o caminho começa com .ruru/
    if (!filePathQuery.startsWith('.ruru/')) {
        // Log de segurança pode ser adicionado aqui
        console.warn(`Tentativa de acesso fora do diretório .ruru/: ${filePathQuery}`);
        return res.status(403).json({ error: 'Access forbidden. Path must start with .ruru/' });
    }

    try {
        // Determina a raiz real do projeto (um nível acima de process.cwd() que está em /stayf)
        const actualProjectRoot = path.resolve(process.cwd(), '..');

        // Resolve o caminho absoluto do arquivo usando a raiz real do projeto
        const absolutePath = path.resolve(actualProjectRoot, filePathQuery);

        // Ajusta a definição do diretório .ruru para a verificação de segurança, usando a raiz real do projeto
        const correctRuruDir = path.resolve(actualProjectRoot, '.ruru');

        // Normaliza ambos os caminhos para comparação consistente entre OS
        const normalizedAbsolutePath = path.normalize(absolutePath);
        // Adiciona separador para garantir que a pasta raiz não seja permitida e usa o diretório correto
        const normalizedCorrectRuruDir = path.normalize(correctRuruDir + path.sep);

        if (!normalizedAbsolutePath.startsWith(normalizedCorrectRuruDir)) {
             console.warn(`Tentativa de acesso fora do diretório .ruru/ (após resolução): ${filePathQuery} resolvido para ${absolutePath}`);
             return res.status(403).json({ error: 'Access forbidden. Invalid path after resolution.' });
        }

        const fileContent = await fs.readFile(absolutePath, 'utf-8');
        return res.status(200).json({ content: fileContent });

    } catch (error: any) {
        console.error(`Error reading file ${filePathQuery}:`, error);
        if (error.code === 'ENOENT') {
            return res.status(404).json({ error: `File not found: ${filePathQuery}` });
        }
        return res.status(500).json({ error: 'Internal Server Error reading file.' });
    }
}