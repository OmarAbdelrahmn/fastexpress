import { redirect } from 'next/navigation';

// Templates are created and certified by the selected built-in import endpoint.
// Keep this legacy URL working without exposing the retired manual workflow.
export default function ImportTemplatesPage() {
  redirect('/accountant/imports');
}
