import requestIp from 'request-ip';


// EXPORT config to tell Next.js NOT to parse the body
export const config = {
    api: {
        bodyParser: false
    }
};

// Get raw body as string
async function getRawBody(readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}


export default async function handler(req, res) {
    try {
        const { method, headers } = req;
        console.info(headers); 
        const body = await getRawBody(req)
        const { proxy } = req.query
        delete req.query.proxy
        // Define the URL you want to proxy to
        const queryParams = new URLSearchParams(req.query);
        const url = `http://0.0.0.0:8080/${proxy !== undefined ? proxy.join('/') : ''}?${queryParams.toString()}`;
        let newHeader = { ...headers }
        newHeader['origin'] = newHeader['referer']
        delete newHeader['host']
        delete newHeader['content-length']
        delete newHeader['x-forwarded-for']
        delete newHeader['x-datadog-trace-id']
        delete newHeader['x-datadog-parent-id']
        delete newHeader['x-datadog-origin']
        delete newHeader['x-datadog-sampling-priority']
        newHeader['x-req-client-ip'] = requestIp.getClientIp(req)
        if (newHeader['x-req-client-ip'] === "::1") {
            delete newHeader['x-req-client-ip']
        }
        const _request = new Request(url, {
            method: method,
            body: method !== "GET" && method !== "HEAD" ? body : undefined,
            headers: newHeader
        });
        // Forward the request
        const response = await fetch(_request);

        // Pass along the headers from the target server's response
        for (const [key, value] of response.headers.entries()) {
          res.setHeader(key, value);
        }
        // Set status code from target response
        res.statusCode = response.status;
        // Manually stream the response body from target server to client
        const blob = await response.blob();
        const _blob = await blob.text();
        res.write(_blob);
        res.end();
    } catch (error) {
        // Handle errors
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
