export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-lg font-medium">Carregando Task Executor...</p>
        <p className="text-sm text-muted-foreground">Preparando ambiente de execução</p>
      </div>
    </div>
  );
}
