/**
 * "Criar meu primeiro plano" on the last onboarding step: the onboarding route
 * disappears the moment the flag flips (Stack.Protected), so it cannot push
 * the next screen itself. It leaves this note instead, and Meus negócios —
 * the screen the stack lands on — opens Novo negócio once on mount.
 */
let abrirNovo = false;

export function pedirNovoNegocioAoEntrar(): void {
  abrirNovo = true;
}

/** True once per request. */
export function consumirPedidoNovoNegocio(): boolean {
  const pedido = abrirNovo;
  abrirNovo = false;
  return pedido;
}
