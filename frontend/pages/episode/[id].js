import { useRouter } from 'next/router';

export default function Episode() {
  const router = useRouter();
  const { id } = router.query;

  return <div>Episode ID: {id}</div>;
}