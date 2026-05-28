import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Legacy URL — canonical thread route uses ?conversation= */
export default async function MessageThreadRedirect({ params }: Props) {
  const { id } = await params;
  redirect(`/messages?conversation=${id}`);
}
