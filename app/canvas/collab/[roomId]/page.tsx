import CollabCanvasPage from "@/components/CollabCanvasPage";

export default async function CollabRoute({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return <CollabCanvasPage roomId={roomId} />;
}
