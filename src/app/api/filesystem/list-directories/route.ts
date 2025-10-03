import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { dirPath } = await request.json();

    // Se não fornecer caminho, usa o diretório home do usuário atual
    const basePath = dirPath || process.env.HOME || '/home';

    // Validação de segurança: não permite acessar paths acima do home
    const homePath = process.env.HOME || '/home';
    const resolvedPath = path.resolve(basePath);

    if (!resolvedPath.startsWith(homePath) && !resolvedPath.startsWith('/home')) {
      return NextResponse.json(
        { error: 'Acesso negado a este diretório' },
        { status: 403 }
      );
    }

    // Listar conteúdo do diretório
    const entries = await fs.readdir(resolvedPath, { withFileTypes: true });

    const directories = entries
      .filter(entry => entry.isDirectory())
      .map(entry => ({
        name: entry.name,
        path: path.join(resolvedPath, entry.name),
        isHidden: entry.name.startsWith('.'),
      }))
      .sort((a, b) => {
        // Diretórios não-ocultos primeiro
        if (a.isHidden !== b.isHidden) {
          return a.isHidden ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      currentPath: resolvedPath,
      parentPath: path.dirname(resolvedPath),
      directories,
    });

  } catch (error: any) {
    console.error('Error listing directories:', error);

    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Diretório não encontrado' },
        { status: 404 }
      );
    }

    if (error.code === 'EACCES') {
      return NextResponse.json(
        { error: 'Permissão negada para acessar este diretório' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Erro ao listar diretórios' },
      { status: 500 }
    );
  }
}
