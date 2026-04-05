# Bidas (VetAnest.IA)

Co-piloto de anestesiologia veterinária em Next.js 15 com foco em usabilidade no centro cirúrgico:

- Cadastro de pacientes com persistência (Supabase, com fallback local para desenvolvimento)
- Calculadora inicial de doses por peso com fórmula explícita e confirmação obrigatória
- Base de schema SQL para fluxo perioperatório e trilha de monitoramento
- PWA com `manifest`, `service worker` e instalação no dispositivo

## Requisitos

- Node.js 20+
- npm 10+
- (Opcional) Projeto Supabase para persistência em nuvem

## Configuração rápida

1. Instale dependências:

```bash
npm install
```

2. (Opcional) Configure Supabase:

```bash
cp .env.example .env.local
```

Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. Rode o schema no SQL Editor do Supabase:

- arquivo: `supabase/schema.sql`

## Rodar local

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Teste funcional local (checklist)

1. Cadastro
- Preencha nome + espécie + peso e salve.
- Verifique se aparece na lista de pacientes.

2. Seleção de paciente
- Clique em um paciente da lista.
- Confirme que o peso preenche a calculadora.

3. Cálculo de dose
- Valide dose alvo/faixa/fórmula para cada fármaco.
- Marque confirmação obrigatória e veja habilitação do botão de log.

4. Fonte de dados
- Sem `.env.local`, deve mostrar modo `LocalStorage`.
- Com Supabase configurado, deve mostrar `Supabase`.

5. PWA
- Abra DevTools > Application > Service Workers e confirme `/sw.js` ativo.
- Em Application > Manifest, valide ícones e modo `standalone`.
- No Chrome/Edge, clique em instalar app (quando disponível).

## Observação de build no Windows

Em caminhos com acentuação (ex.: `Área de Trabalho`), o Next.js/TypeScript pode falhar no `next build` por normalização de path.
Se ocorrer, mova o projeto para um caminho sem acentos (ex.: `C:\dev\ProjetoBidas`) e rode novamente:

```bash
npm run build
```
