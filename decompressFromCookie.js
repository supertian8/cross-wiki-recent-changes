async function decompressData (toDecode) {
	//Code from https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/writable
	const stream = new DecompressionStream("gzip");

	// Write data to be compressed
	const data = Uint8Array.fromBase64(
	  toDecode,
	);
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
	let finalDecompression = new TextDecoder().decode(new Uint8Array(output));
	finalDecompression = finalDecompression.split("\n").slice(1).join("\n") //Removes the first line of the string
	//console.log(finalDecompression);
	return finalDecompression
}