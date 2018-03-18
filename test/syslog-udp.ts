import { expect } from 'code';
import { script } from 'lab';
export const lab = script();

import { createSocket, Socket } from 'dgram';
import { RemoteSyslog, SEVERITY, FACILITY } from '../src';
import { hostname } from 'os';

const { experiment, test, before, after } = lab;
const debug = require('debug')('rsyslog-test');

experiment('syslog over UDP', () => {
    let socket: Socket;
    let messages: Buffer[] = [];
    let address: string;
    let port: number;

    before(() => new Promise(resolve => {
        socket = createSocket('udp4');
        socket.on('listening', () => {
            const addr = socket.address();
            debug('listening', addr);
            address = addr.address;
            port = addr.port;
        });

        socket.on('message', message => {
            messages.push(message);
        });
        
        socket.unref();
        socket.bind(0, '127.0.0.1', resolve);
    }));
    
    after(() => new Promise(resolve => {
        socket.close(resolve);
    }));

    test('smallest testable example', async () => {
        clearMessages();

        const rsyslog = new RemoteSyslog({
            target_host: address,
            target_port: port,
        });
        rsyslog.once('error', () => { /* la la la la a */ });
        rsyslog.send(SEVERITY.NOTICE, "I'm awake!", {
            timestamp: 1521416285134,
        });

        await waitLongEnough();

        expect(messages.length, 'packet count').to.equal(1);
        expect(messages[0].toString(), 'packet').to.equal(`<133>1 2018-03-18T23:38:05.134Z ${hostname()} - ${process.pid} - I\'m awake!`);
    });

    test('overriding hostname, appname, facility, severity, and msgid', async () => {
        clearMessages();

        const rsyslog = new RemoteSyslog({
            target_host: address,
            target_port: port,
            hostname: 'sender',
            appname: 'appname',
            facility: FACILITY.local7,
        });
        rsyslog.once('error', () => { /* la la la la a */ });
        rsyslog.send(SEVERITY.EMERG, "I'm awake!", {
            timestamp: 1521416285134,
            msgid: 'operation'
        });

        await waitLongEnough();

        expect(messages.length, 'packet count').to.equal(1);
        expect(messages[0].toString(), 'packet').to.equal(`<184>1 2018-03-18T23:38:05.134Z sender appname ${process.pid} operation I\'m awake!`);
    });


    /** Clear the messages */
    function clearMessages() {
        messages.splice(0); // flush
    }

    /** Wait a little, as the send operation is faux-synchronous */
    async function waitLongEnough() {
        await new Promise(cb => setTimeout(cb, 5));
    }
});