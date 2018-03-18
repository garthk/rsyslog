# rsyslog

Sprays packets to a remote RFC5424 syslog, e.g. at [Papertrail]

[Papertrail]: https://papertrailapp.com
[RFC5424]: https://tools.ietf.org/html/rfc5424

Relying on the defaults:

```js
const { RemoteSyslog, SEVERITY } = require('rsyslog');
const rsyslog = new RemoteSyslog();
rsyslog.once('error', err => { /* catch it, or Node will crash */ });
rsyslog.send(SEVERITY.NOTICE, "I'm awake!");
```

Specifying the results in full detail:

```js
const { RemoteSyslog, FACILITY, SEVERITY, NILVALUE } = require('rsyslog');
const os = require('os');
const rsyslog = new RemoteSyslog({
    target_host: '127.0.0.1', // syslog server's hostname
    target_port: 514, // syslog server's port
    hostname: os.hostname(), // sender's hostname
    facility: FACILITY.local0, // 'local0' would also do
    appname: NILVALUE,
});
rsyslog.once('error', err => { /* catch it, or Node will crash */ });
rsyslog.send(SEVERITY.NOTICE, "I'm awake!", {
    timestamp: Date.now(),
    syslog_msgid: NILVALUE,
});
```
