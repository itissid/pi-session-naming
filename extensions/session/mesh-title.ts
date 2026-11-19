// pi-mesh stores its optional conversation title after the identity and room list.
const SEPARATOR = " — ";
const ALIAS = "[a-z][a-z0-9-]{1,31}";
const ROOM = "[a-z0-9][a-z0-9.-]{0,63}";
const PREFIX = new RegExp(`^mesh @${ALIAS}(?: · ${ROOM}(?:,${ROOM})*)?$`);

export function splitMeshTitle(title: string | undefined): { prefix: string; suffix: string } | undefined {
	if (!title) return undefined;
	const boundary = title.indexOf(SEPARATOR);
	const prefix = boundary === -1 ? title : title.slice(0, boundary);
	if (!PREFIX.test(prefix)) return undefined;
	return { prefix, suffix: boundary === -1 ? "" : title.slice(boundary + SEPARATOR.length) };
}

export function preserveMeshPrefix(current: string | undefined, name: string): string {
	const mesh = splitMeshTitle(current);
	if (!mesh) return name;
	const pastedTitle = splitMeshTitle(name);
	const suffix = pastedTitle?.prefix === mesh.prefix ? pastedTitle.suffix : name;
	return suffix ? `${mesh.prefix}${SEPARATOR}${suffix}` : mesh.prefix;
}
