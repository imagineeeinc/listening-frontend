import { error } from '@sveltejs/kit';

export function load({ params }) {
	let username = params.username
  return { username }
	error(404, 'Not found');
}
