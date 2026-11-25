async function compressData (toEncode) {
	//Code from https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream/writable
	const stream = new CompressionStream("gzip");
  
	// Write data to be compressed
	const data = new TextEncoder().encode(toEncode);
	const writer = stream.writable.getWriter();
	writer.write(data);
	writer.close();
  
	// Read compressed data
	const reader = stream.readable.getReader();
	let done = false;
	let output = [];
	while (!done) {
		const result = await reader.read();
		if (result.value) {
			output.push(...result.value);
		}
		done = result.done;
	}
	
	const finalCompression = await new Uint8Array(output).toBase64();
	return finalCompression;
}