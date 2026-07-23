import { listarAdminsAction } from '@/lib/admin-actions'
import { AdicionarAdminForm } from './adicionar-admin-form'
import { ExcluirAdminButton } from './excluir-admin-button'

export default async function AdminUsuariosPage() {
  const admins = await listarAdminsAction()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Usuários Administradores</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Gerencie os administradores da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-1">
          <AdicionarAdminForm />
        </div>

        {/* Lista */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {admins.length} administrador(es)
            </p>
          </div>

          {admins.length === 0 ? (
            <div className="text-center py-16 text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-lg">Nenhum administrador cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-600 dark:text-zinc-400 shrink-0">
                        {(admin.nome || admin.username || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {admin.username || admin.nome}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{admin.email}</p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          Criado em {new Date(admin.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        admin.papel === 'ADMIN_PLATAFORMA'
                          ? 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400'
                          : admin.papel === 'ADMIN_PSICH'
                          ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400'
                          : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        {admin.papel === 'ADMIN_PLATAFORMA' ? 'Sistema' : admin.papel === 'ADMIN_PSICH' ? 'Psicólogo' : 'Suporte'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        admin.status === 'ativo'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {admin.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </span>
                      <ExcluirAdminButton adminId={admin.id} adminNome={admin.nome} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
