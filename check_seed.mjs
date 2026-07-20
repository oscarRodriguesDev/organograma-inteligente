import { PrismaClient } from './generated/prisma/index.js';

const p = new PrismaClient();

try {
  // CEO
  const ceo = await p.colaborador.findUnique({ where: { id: 'cmrr3akpp0001qgdogqa7yv1r' } });
  console.log('CEO:', ceo?.nome, '| Funcao:', ceo?.funcao, '| Papel:', ceo?.papel, '| EmpresaId:', ceo?.empresaId);

  if (!ceo) {
    console.log('CEO NAO ENCONTRADO!');
    await p.$disconnect();
    process.exit(1);
  }

  // Count by papel
  const count = await p.colaborador.groupBy({
    by: ['papel'],
    _count: true,
    where: { empresaId: ceo.empresaId }
  });
  console.log('\nTotal por papel na empresa:');
  count.forEach(c => console.log('  ', c.papel, ':', c._count));

  const total = await p.colaborador.count({ where: { empresaId: ceo.empresaId } });
  console.log('\nTotal colaboradores na empresa:', total);

  // Check some diretores
  const diretores = await p.colaborador.findMany({
    where: { empresaId: ceo.empresaId, papel: 'DIRETOR' },
    select: { id: true, nome: true, funcao: true }
  });
  console.log('\nDiretores:', diretores.length);
  diretores.forEach(d => console.log('  -', d.id, d.nome, d.funcao));

} catch(e) {
  console.error('Erro:', e.message);
} finally {
  await p.$disconnect();
}
