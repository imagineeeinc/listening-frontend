import { error } from '@sveltejs/kit';

export function load({ params, url }) {
	let username = params.username
  let kiosk = url.searchParams.get('kiosk') || false
  return { username, kiosk }
	error(404, 'Not found');
}
