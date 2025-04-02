import { error } from '@sveltejs/kit';

export function load({ params, url }) {
	let username = params.username
  let kiosk = url.searchParams.get('kiosk') || false
	let awake = url.searchParams.get('awake') || false
	let iframe = url.searchParams.get('iframe')
  return { username, kiosk, awake, iframe }
	error(404, 'Not found');
}
