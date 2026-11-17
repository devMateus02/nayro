/** Dados estruturados (schema.org) para o Google e as IAs entenderem a página */
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // `<` vira <: nenhum texto vindo do banco consegue fechar a tag <script>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
