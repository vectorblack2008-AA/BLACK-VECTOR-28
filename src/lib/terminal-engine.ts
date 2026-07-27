export interface FileNode {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  children?: { [name: string]: FileNode };
  permissions?: string;
  size?: number;
}

export interface CommandResult {
  output: string;
  error?: boolean;
  cwd?: string;
  fs?: FileNode;
}

let currentCwd = '/home/user';
let fileCounter = 0;

const defaultFilesystem: FileNode = {
  name: '/',
  type: 'dir',
  children: {
    home: {
      name: 'home',
      type: 'dir',
      children: {
        user: {
          name: 'user',
          type: 'dir',
          children: {
            Documents: {
              name: 'Documents',
              type: 'dir',
              children: {
                project: {
                  name: 'project',
                  type: 'dir',
                  children: {
                    'index.html': { name: 'index.html', type: 'file', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>', permissions: '-rw-r--r--', size: 102 },
                    'style.css': { name: 'style.css', type: 'file', content: 'body {\n  margin: 0;\n  padding: 20px;\n  font-family: Arial;\n  background: #1e1e2e;\n  color: #cdd6f4;\n}\nh1 { color: #89b4fa; }', permissions: '-rw-r--r--', size: 126 },
                    'script.js': { name: 'script.js', type: 'file', content: '// Main application\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n  return true;\n}\ngreet("User");', permissions: '-rw-r--r--', size: 103 },
                  },
                },
                'notes.txt': { name: 'notes.txt', type: 'file', content: 'Linux Learning Notes\n====================\n1. Always use man pages\n2. Practice daily\n3. Master the basics first\n4. Use tab completion\n5. Never run rm -rf /', permissions: '-rw-r--r--', size: 139 },
                'todo.md': { name: 'todo.md', type: 'file', content: '# Todo List\n\n- [x] Install Linux\n- [ ] Learn ls command\n- [ ] Learn grep\n- [ ] Practice permissions\n- [ ] Start bash scripting', permissions: '-rw-r--r--', size: 121 },
              },
            },
            Downloads: {
              name: 'Downloads',
              type: 'dir',
              children: {
                'linux-guide.pdf': { name: 'linux-guide.pdf', type: 'file', content: '[PDF] Linux Command Guide - Table of Contents\nChapter 1: Introduction\nChapter 2: File Operations\nChapter 3: Text Processing\nChapter 4: Permissions', permissions: '-rw-r--r--', size: 4096 },
                'wallpaper.png': { name: 'wallpaper.png', type: 'file', content: '[Binary data] PNG image 1920x1080', permissions: '-rw-r--r--', size: 245760 },
              },
            },
            Desktop: {
              name: 'Desktop',
              type: 'dir',
              children: {
                'readme.md': { name: 'readme.md', type: 'file', content: '# Welcome to Linux!\n\nThis is your desktop.\nUse this terminal to practice commands.\n\n$ whoami\n$ pwd\n$ ls -la', permissions: '-rw-r--r--', size: 108 },
              },
            },
            'practice.sh': { name: 'practice.sh', type: 'file', content: '#!/bin/bash\n# Practice script\necho "Starting practice..."\ndate\nwhoami\necho "Done!"', permissions: '-rwxr-xr-x', size: 95 },
            'secret.txt': { name: 'secret.txt', type: 'file', content: 'Congratulations! 🎉\nYou found the secret file!\nHere is your reward: Linux is awesome!', permissions: '-rw-------', size: 86 },
          },
        },
      },
    },
    etc: {
      name: 'etc',
      type: 'dir',
      children: {
        'passwd': { name: 'passwd', type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nuser:x:1000:1000:User,,,:/home/user:/bin/bash', permissions: '-rw-r--r--', size: 128 },
        'hosts': { name: 'hosts', type: 'file', content: '127.0.0.1  localhost\n127.0.1.1  my-computer\n::1        ip6-localhost ip6-loopback', permissions: '-rw-r--r--', size: 85 },
        'hostname': { name: 'hostname', type: 'file', content: 'bv-terminal\n', permissions: '-rw-r--r--', size: 11 },
        'issue': { name: 'issue', type: 'file', content: 'Black Vector Terminal v1.0 \\n \\l\n\nWelcome to Linux!\n', permissions: '-rw-r--r--', size: 50 },
      },
    },
    var: {
      name: 'var',
      type: 'dir',
      children: {
        log: {
          name: 'log',
          type: 'dir',
          children: {
            'syslog': { name: 'syslog', type: 'file', content: 'May 30 10:00:01 bv kernel: Linux version 6.8.0\nMay 30 10:00:02 bv systemd[1]: Starting system\nMay 30 10:00:05 bv sshd[1234]: Server listening on 0.0.0.0 port 22\nMay 30 10:05:12 bv user[5678]: Logged in user\nMay 30 10:10:00 bv sudo[9012]: user : TTY=pts/0\nMay 30 10:15:30 bv kernel: eth0: Link up', permissions: '-rw-r--r--', size: 290 },
            'access.log': { name: 'access.log', type: 'file', content: '192.168.1.1 - - [30/May/2026:10:00:00] "GET /" 200 1234\n192.168.1.10 - - [30/May/2026:10:01:00] "GET /about" 200 567\n192.168.1.50 - - [30/May/2026:10:02:00] "POST /login" 302 0\n10.0.0.1 - - [30/May/2026:10:05:00] "GET /admin" 404 230', permissions: '-rw-r--r--', size: 235 },
          },
        },
      },
    },
    tmp: {
      name: 'tmp',
      type: 'dir',
      children: {},
    },
  },
};

function cloneFS(node: FileNode): FileNode {
  if (node.type === 'file') {
    return { ...node, content: node.content };
  }
  const children: { [name: string]: FileNode } = {};
  if (node.children) {
    for (const [k, v] of Object.entries(node.children)) {
      children[k] = cloneFS(v);
    }
  }
  return { ...node, children };
}

function getNode(fs: FileNode, path: string): FileNode | null {
  if (path === '/' || path === '') return fs;
  const parts = path.split('/').filter(Boolean);
  let current = fs;
  for (const part of parts) {
    if (!current.children || !current.children[part]) return null;
    current = current.children[part];
  }
  return current;
}

function resolvePath(fs: FileNode, cwd: string, raw: string): string {
  if (raw.startsWith('/')) return normalizePath(raw);
  if (raw.startsWith('~/') || raw === '~') {
    const home = '/home/user';
    return normalizePath(raw.replace('~', home));
  }
  return normalizePath(`${cwd}/${raw}`);
}

function normalizePath(p: string): string {
  const parts = p.split('/').filter(Boolean);
  const result: string[] = [];
  for (const part of parts) {
    if (part === '.') continue;
    if (part === '..') { result.pop(); continue; }
    result.push(part);
  }
  return '/' + result.join('/');
}

function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return '/' + parts.join('/');
}

function getBasename(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '/';
}

function listDir(fs: FileNode, cwd: string, path: string, opts: { long?: boolean; all?: boolean }): string {
  let target: FileNode | null;
  if (path) {
    const resolved = resolvePath(fs, cwd, path);
    target = getNode(fs, resolved);
  } else {
    target = getNode(fs, cwd);
  }

  if (!target) return `ls: cannot access '${path}': No such file or directory`;
  if (target.type === 'file') {
    return (opts.long ? `-rw-r--r-- 1 user user ${target.size || 0} Jan 1 12:00 ` : '') + target.name;
  }

  const entries = target.children ? Object.entries(target.children) : [];
  let names = entries.map(([name, node]) => ({ name, node }));

  if (!opts.all) {
    names = names.filter(n => !n.name.startsWith('.'));
  }

  if (opts.long) {
    const lines = names.map(n => {
      const perms = n.node.type === 'dir' ? 'd' + (n.node.permissions?.slice(1) || 'rwxr-xr-x')
        : n.node.permissions || '-rw-r--r--';
      const size = n.node.size || 0;
      return `${perms} 1 user user ${String(size).padStart(6)} Jan 1 12:00 ${n.name}${n.node.type === 'dir' ? '/' : ''}`;
    });
    if (opts.all) {
      lines.unshift('drwxr-xr-x 1 user user    0 Jan 1 12:00 ./');
      lines.unshift('drwxr-xr-x 1 user user    0 Jan 1 12:00 ../');
    }
    return lines.join('\n');
  }

  if (opts.all) {
    names.unshift({ name: '.', node: { name: '.', type: 'dir' } });
    names.unshift({ name: '..', node: { name: '..', type: 'dir' } });
  }

  return names.map(n => n.name + (n.node.type === 'dir' ? '/' : '')).join('  ') || '(empty)';
}

function showFileContent(fs: FileNode, cwd: string, path: string): string {
  const resolved = resolvePath(fs, cwd, path);
  const node = getNode(fs, resolved);
  if (!node) return `cat: ${getBasename(path)}: No such file or directory`;
  if (node.type === 'dir') return `cat: ${getBasename(path)}: Is a directory`;
  return node.content || '';
}

function makeDir(fs: FileNode, cwd: string, path: string): { fs: FileNode; error?: string } {
  const resolved = resolvePath(fs, cwd, path);
  const parentPath = getParentPath(resolved);
  const dirName = getBasename(resolved);
  const parent = getNode(fs, parentPath);
  if (!parent) return { fs, error: `mkdir: cannot create directory '${path}': No such file or directory` };
  if (parent.type === 'file') return { fs, error: `mkdir: cannot create directory '${path}': Not a directory` };
  if (parent.children?.[dirName]) return { fs, error: `mkdir: cannot create directory '${path}': File exists` };
  const newFS = cloneFS(fs);
  const newParent = getNode(newFS, parentPath);
  if (newParent && newParent.children) {
    newParent.children[dirName] = { name: dirName, type: 'dir', children: {} };
  }
  return { fs: newFS };
}

function touchFile(fs: FileNode, cwd: string, path: string): { fs: FileNode; error?: string } {
  const resolved = resolvePath(fs, cwd, path);
  const parentPath = getParentPath(resolved);
  const fileName = getBasename(resolved);
  const parent = getNode(fs, parentPath);
  if (!parent) return { fs, error: `touch: cannot touch '${path}': No such file or directory` };
  if (parent.children?.[fileName]) return { fs };
  const newFS = cloneFS(fs);
  const newParent = getNode(newFS, parentPath);
  if (newParent && newParent.children) {
    fileCounter++;
    newParent.children[fileName] = {
      name: fileName,
      type: 'file',
      content: '',
      permissions: '-rw-r--r--',
      size: 0,
    };
  }
  return { fs: newFS };
}

function removeNode(fs: FileNode, cwd: string, path: string, recursive: boolean): { fs: FileNode; error?: string } {
  const resolved = resolvePath(fs, cwd, path);
  const node = getNode(fs, resolved);
  if (!node) return { fs, error: `rm: cannot remove '${path}': No such file or directory` };
  if (node.type === 'dir' && !recursive) {
    return { fs, error: `rm: cannot remove '${path}': Is a directory (use -rf for directories)` };
  }
  if (resolved === '/' || resolved === '/home' || resolved === '/etc' || resolved === '/var') {
    return { fs, error: `rm: cannot remove '${path}': Permission denied (protected)` };
  }
  const parentPath = getParentPath(resolved);
  const name = getBasename(resolved);
  const newFS = cloneFS(fs);
  const parent = getNode(newFS, parentPath);
  if (parent?.children) {
    delete parent.children[name];
  }
  return { fs: newFS };
}

function copyNode(fs: FileNode, cwd: string, src: string, dst: string): { fs: FileNode; error?: string } {
  const srcResolved = resolvePath(fs, cwd, src);
  const srcNode = getNode(fs, srcResolved);
  if (!srcNode) return { fs, error: `cp: cannot stat '${src}': No such file or directory` };
  const dstResolved = resolvePath(fs, cwd, dst);
  const dstParentPath = getParentPath(dstResolved);
  const dstName = getBasename(dstResolved);
  const dstParent = getNode(fs, dstParentPath);
  if (!dstParent) return { fs, error: `cp: cannot create '${dst}': No such file or directory` };
  if (srcNode.type === 'dir') return { fs, error: `cp: -r not specified; omitting directory '${src}'` };
  const newFS = cloneFS(fs);
  const newDstParent = getNode(newFS, dstParentPath);
  if (newDstParent?.children) {
    newDstParent.children[dstName] = cloneFS(srcNode);
    newDstParent.children[dstName].name = dstName;
  }
  return { fs: newFS };
}

function moveNode(fs: FileNode, cwd: string, src: string, dst: string): { fs: FileNode; error?: string } {
  const srcResolved = resolvePath(fs, cwd, src);
  const srcNode = getNode(fs, srcResolved);
  if (!srcNode) return { fs, error: `mv: cannot stat '${src}': No such file or directory` };
  if (srcResolved === '/' || srcResolved === '/home' || srcResolved === '/etc' || srcResolved === '/var') {
    return { fs, error: `mv: cannot move '${src}': Permission denied (protected)` };
  }
  const dstResolved = resolvePath(fs, cwd, dst);
  const dstParentPath = getParentPath(dstResolved);
  const dstName = getBasename(dstResolved);
  const dstParent = getNode(fs, dstParentPath);
  if (!dstParent) return { fs, error: `mv: cannot move '${src}' to '${dst}': No such file or directory` };
  const newFS = cloneFS(fs);
  const srcParentPath = getParentPath(srcResolved);
  const srcName = getBasename(srcResolved);
  const srcParent = getNode(newFS, srcParentPath);
  if (srcParent?.children?.[srcName]) {
    const moved = cloneFS(srcParent.children[srcName]);
    moved.name = dstName;
    delete srcParent.children[srcName];
    const newDstParent = getNode(newFS, dstParentPath);
    if (newDstParent?.children) {
      newDstParent.children[dstName] = moved;
    }
  }
  return { fs: newFS };
}

function headFile(fs: FileNode, cwd: string, path: string, n: number): string {
  const resolved = resolvePath(fs, cwd, path);
  const node = getNode(fs, resolved);
  if (!node) return `head: ${getBasename(path)}: No such file or directory`;
  if (node.type === 'dir') return `head: ${getBasename(path)}: Is a directory`;
  const lines = (node.content || '').split('\n');
  return lines.slice(0, n).join('\n');
}

function tailFile(fs: FileNode, cwd: string, path: string, n: number): string {
  const resolved = resolvePath(fs, cwd, path);
  const node = getNode(fs, resolved);
  if (!node) return `tail: ${getBasename(path)}: No such file or directory`;
  if (node.type === 'dir') return `tail: ${getBasename(path)}: Is a directory`;
  const lines = (node.content || '').split('\n');
  return lines.slice(-n).join('\n');
}

function wcFile(fs: FileNode, cwd: string, path: string): string {
  const resolved = resolvePath(fs, cwd, path);
  const node = getNode(fs, resolved);
  if (!node) return `wc: ${getBasename(path)}: No such file or directory`;
  const content = node.content || '';
  const lines = content.split('\n').length;
  const words = content.split(/\s+/).filter(Boolean).length;
  const chars = content.length;
  return `${lines} ${words} ${chars} ${getBasename(path)}`;
}

function executeEcho(fs: FileNode, cwd: string, args: string[]): { fs: FileNode; output: string } {
  if (args.length === 0) return { fs, output: '' };

  const redirectIdx = args.indexOf('>');
  if (redirectIdx !== -1) {
    const content = args.slice(0, redirectIdx).join(' ');
    let fileName = args.slice(redirectIdx + 1).join('');
    if (!fileName) return { fs, output: 'echo: syntax error: expected file name after >' };

    const resolved = resolvePath(fs, cwd, fileName);
    const parentPath = getParentPath(resolved);
    const baseName = getBasename(resolved);
    const newFS = cloneFS(fs);
    const parent = getNode(newFS, parentPath);
    if (!parent || !parent.children) return { fs, output: `echo: ${fileName}: No such file or directory` };

    parent.children[baseName] = {
      name: baseName,
      type: 'file',
      content: content + '\n',
      permissions: '-rw-r--r--',
      size: content.length + 1,
    };
    return { fs: newFS, output: '' };
  }

  return { fs, output: args.join(' ') };
}

export function executeCommand(command: string, lang: 'ar' | 'en', fs?: FileNode): CommandResult {
  if (!fs) {
    fs = defaultFilesystem;
    currentCwd = '/home/user';
  }

  const trimmed = command.trim();
  if (!trimmed) return { output: '' };

  const parts = trimmed.match(/(?:[^\s"']+|["'][^"']*["'])+/g) || [];
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1).map(a => a.replace(/^["']|["']$/g, ''));

  const errorMsg = (msg: string) => ({ output: msg, error: true });

  switch (cmd) {
    case 'pwd': {
      return { output: currentCwd };
    }

    case 'ls': {
      const long = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const all = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const path = args.filter(a => !a.startsWith('-'))[0] || '';
      const output = listDir(fs, currentCwd, path, { long, all });
      return { output };
    }

    case 'cd': {
      const target = args[0] || '/home/user';
      const resolved = resolvePath(fs, currentCwd, target);
      const node = getNode(fs, resolved);
      if (!node) return errorMsg(`cd: ${target}: No such file or directory`);
      if (node.type === 'file') return errorMsg(`cd: ${target}: Not a directory`);
      currentCwd = resolved;
      return { output: '', cwd: currentCwd };
    }

    case 'cat': {
      if (args.length === 0) return errorMsg('cat: missing operand');
      const output = args.map(a => showFileContent(fs, currentCwd, a)).join('\n');
      return { output };
    }

    case 'echo': {
      const result = executeEcho(fs, currentCwd, args);
      return { fs: result.fs, output: result.output };
    }

    case 'mkdir': {
      if (args.length === 0) return errorMsg('mkdir: missing operand');
      let newFS = fs;
      for (const dir of args) {
        const result = makeDir(newFS, currentCwd, dir);
        if (result.error) return errorMsg(result.error);
        newFS = result.fs;
      }
      return { fs: newFS, output: '' };
    }

    case 'touch': {
      if (args.length === 0) return errorMsg('touch: missing operand');
      let newFS = fs;
      for (const file of args) {
        const result = touchFile(newFS, currentCwd, file);
        if (result.error) return errorMsg(result.error);
        newFS = result.fs;
      }
      return { fs: newFS, output: '' };
    }

    case 'rm': {
      if (args.length === 0) return errorMsg('rm: missing operand');
      const recursive = args.includes('-r') || args.includes('-rf') || args.includes('-fr');
      const force = args.includes('-f') || args.includes('-rf') || args.includes('-fr');
      const targets = args.filter(a => !a.startsWith('-'));
      let newFS = fs;
      for (const target of targets) {
        const result = removeNode(newFS, currentCwd, target, recursive);
        if (result.error && !force) return errorMsg(result.error);
        newFS = result.fs;
      }
      return { fs: newFS, output: '' };
    }

    case 'cp': {
      const src = args[0];
      const dst = args[1];
      if (!src || !dst) return errorMsg('cp: missing operand');
      const result = copyNode(fs, currentCwd, src, dst);
      if (result.error) return errorMsg(result.error);
      return { fs: result.fs, output: '' };
    }

    case 'mv': {
      const src = args[0];
      const dst = args[1];
      if (!src || !dst) return errorMsg('mv: missing operand');
      const result = moveNode(fs, currentCwd, src, dst);
      if (result.error) return errorMsg(result.error);
      return { fs: result.fs, output: '' };
    }

    case 'head': {
      const nIdx = args.findIndex(a => a.startsWith('-n'));
      let n = 10;
      let fileArgIdx = 0;
      if (nIdx !== -1 && nIdx + 1 < args.length) {
        n = parseInt(args[nIdx + 1], 10) || 10;
        fileArgIdx = nIdx + 2;
      }
      const target = args[fileArgIdx] || args[0];
      if (!target) return errorMsg('head: missing operand');
      const output = headFile(fs, currentCwd, target, n);
      return { output };
    }

    case 'tail': {
      const nIdx = args.findIndex(a => a.startsWith('-n'));
      let n = 10;
      let fileArgIdx = 0;
      if (nIdx !== -1 && nIdx + 1 < args.length) {
        n = parseInt(args[nIdx + 1], 10) || 10;
        fileArgIdx = nIdx + 2;
      }
      const target = args[fileArgIdx] || args[0];
      if (!target) return errorMsg('tail: missing operand');
      const output = tailFile(fs, currentCwd, target, n);
      return { output };
    }

    case 'wc': {
      if (args.length === 0) return errorMsg('wc: missing operand');
      const output = args.map(a => wcFile(fs, currentCwd, a)).join('\n');
      return { output };
    }

    case 'whoami': {
      return { output: 'user' };
    }

    case 'date': {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const d = days[now.getDay()];
      const m = months[now.getMonth()];
      const date = now.getDate();
      const h = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      const y = now.getFullYear();
      return { output: `${d} ${m} ${date} ${h}:${min}:${s} UTC ${y}` };
    }

    case 'cal': {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();
      const firstDay = new Date(y, m, 1).getDay();
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      let cal = `      ${monthNames[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`;
      cal += '   '.repeat(firstDay);
      for (let d = 1; d <= daysInMonth; d++) {
        cal += String(d).padStart(2) + ' ';
        if ((d + firstDay) % 7 === 0) cal += '\n';
      }
      return { output: cal };
    }

    case 'clear': {
      return { output: '[[clear]]' };
    }

    case 'help': {
      const helpText = lang === 'ar' ? `
الأوامر المتاحة:

  إدارة الملفات:
    pwd        - عرض المسار الحالي
    ls [-la]   - عرض محتويات المجلد
    cd <path>  - التنقل إلى مجلد
    cat <file> - عرض محتوى ملف
    mkdir <n>  - إنشاء مجلد جديد
    touch <f>  - إنشاء ملف جديد
    rm [-rf]   - حذف ملف/مجلد
    cp <s> <d> - نسخ ملف
    mv <s> <d> - نقل/إعادة تسمية

  عرض الملفات:
    head <f>   - أول 10 أسطر
    tail <f>   - آخر 10 أسطر
    wc <f>     - عد الأسطر والكلمات

  النظام:
    echo       - طباعة نص
    whoami     - اسم المستخدم
    date       - التاريخ والوقت
    cal        - التقويم
    clear      - مسح الشاشة
    help       - هذه المساعدة

  التلميحات:
    استخدم > لتحويل الإخراج إلى ملف
    مثال: echo "hello" > file.txt
` : `
Available commands:

  File Management:
    pwd        - Print working directory
    ls [-la]   - List directory contents
    cd <path>  - Change directory
    cat <file> - Show file content
    mkdir <n>  - Create directory
    touch <f>  - Create empty file
    rm [-rf]   - Remove file/directory
    cp <s> <d> - Copy file
    mv <s> <d> - Move/rename file

  Viewing:
    head <f>   - First 10 lines
    tail <f>   - Last 10 lines
    wc <f>     - Count lines, words, chars

  System:
    echo       - Print text
    whoami     - Show username
    date       - Show date/time
    cal        - Show calendar
    clear      - Clear screen
    help       - Show this help

  Tips:
    Use > to redirect output to a file
    Example: echo "hello" > file.txt
`;
      return { output: helpText };
    }

    default: {
      return errorMsg(
        lang === 'ar'
          ? `أمر غير معروف: ${cmd}. اكتب help لعرض الأوامر المتاحة.`
          : `Unknown command: ${cmd}. Type help for available commands.`
      );
    }
  }
}

export function getInitialFS(): FileNode {
  fileCounter = 0;
  currentCwd = '/home/user';
  return cloneFS(defaultFilesystem);
}
