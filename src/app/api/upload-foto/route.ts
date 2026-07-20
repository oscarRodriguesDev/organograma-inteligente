import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { supabaseAdmin, BUCKET_FOTOS, getFotoUrl } from '@/lib/supabase'
import { getSession } from '@/lib/auth'
import { atualizarPerfilAdmin } from '@/lib/db'

export async function POST(request: NextRequest) {
  // Verifica autenticação — qualquer colaborador logado pode trocar a própria foto
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('foto') as File | null

    if (!file) {
      return NextResponse.json({ erro: 'Nenhum arquivo enviado' }, { status: 400 })
    }

    // Valida tipo do arquivo
    const tipoOriginal = file.type
    if (!tipoOriginal.startsWith('image/')) {
      return NextResponse.json({ erro: 'O arquivo precisa ser uma imagem' }, { status: 400 })
    }

    // Lê os bytes da imagem
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    // Processa a imagem com sharp:
    // - Redimensiona para no máximo 400x400 (mantendo proporção)
    // - Extrai o quadrado central (para ficar como foto de perfil)
    // - Converte para PNG
    // - Comprime
    const imagem = sharp(inputBuffer)
    const metadata = await imagem.metadata()

    if (!metadata.width || !metadata.height) {
      return NextResponse.json({ erro: 'Erro ao ler dimensões da imagem' }, { status: 400 })
    }

    // Calcula o quadrado central (menor dimensão)
    const tamanhoQuadrado = Math.min(metadata.width, metadata.height)
    const left = Math.floor((metadata.width - tamanhoQuadrado) / 2)
    const top = Math.floor((metadata.height - tamanhoQuadrado) / 2)

    // Extrai o quadrado central, redimensiona para 400x400, converte para PNG e comprime
    const outputBuffer = await imagem
      .extract({ left, top, width: tamanhoQuadrado, height: tamanhoQuadrado })
      .resize(400, 400, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9, quality: 90 })
      .toBuffer()

    // Nome do arquivo: userId.png
    const fileName = `${session.colaboradorId}.png`

    // Faz upload para o Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_FOTOS)
      .upload(fileName, outputBuffer, {
        contentType: 'image/png',
        upsert: true, // substitui se já existir
      })

    if (uploadError) {
      console.error('Erro Supabase Storage:', uploadError)
      return NextResponse.json({ erro: 'Erro ao salvar a foto no servidor' }, { status: 500 })
    }

    // Obtém a URL pública
    const fotoUrl = getFotoUrl(fileName)

    // Atualiza o campo fotoUrl no banco
    await atualizarPerfilAdmin(session.colaboradorId, { fotoUrl })

    return NextResponse.json({ ok: true, fotoUrl })
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json({ erro: 'Erro interno ao processar a foto' }, { status: 500 })
  }
}
