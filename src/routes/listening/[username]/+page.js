import { error } from '@sveltejs/kit';

export function load({ params, url }) {
	let username = params.username
  let kiosk = url.searchParams.get('kiosk') || false
	let awake = url.searchParams.get('awake') || false
  return { username, kiosk, awake }
	error(404, 'Not found');
}
