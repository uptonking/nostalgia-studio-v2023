import { BinarySearchTree } from './bst';
import * as customUtils from './utils';

/** an AVL tree is a self-balancing binary search tree.
 * - In an AVL tree, the heights of the two child subtrees of any node differ by at most one
 * - Lookup, insertion, and deletion all take `O(log n)` time in both the average and worst cases
 * @internal
 */
class _AVLTree extends BinarySearchTree {
  left: _AVLTree | null;
  right: _AVLTree | null;
  parent: _AVLTree | null;
  /** ❓ for check only */
  height: number;

  /**
   * Constructor of the internal AVLTree
   * @param {Object} options Optional
   * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
   * @param {Key}      options.key Initialize this BST's key with key
   * @param {Value}    options.value Initialize this BST's data with [value]
   * @param {Function} options.compareKeys Initialize this BST's compareKeys
   */
  constructor(options) {
    super();
    options = options || {};

    this.left = null;
    this.right = null;
    this.parent = options.parent !== undefined ? options.parent : null;
    if (Object.hasOwn(options, 'key')) {
      this.key = options.key;
    }
    this.data = Object.hasOwn(options, 'value') ? [options.value] : [];
    this.unique = options.unique || false;

    this.compareKeys =
      options.compareKeys || customUtils.defaultCompareKeysFunction;
    this.checkValueEquality =
      options.checkValueEquality || customUtils.defaultCheckValueEquality;
  }

  /**
   * Check the recorded height is correct for every node
   * Throws if one height doesn't match
   */
  checkHeightCorrect() {
    if (!Object.hasOwn(this, 'key')) {
      return;
    } // Empty tree

    if (this.left && this.left.height === undefined) {
      throw new Error('Undefined height for node ' + this.left.key);
    }
    if (this.right && this.right.height === undefined) {
      throw new Error('Undefined height for node ' + this.right.key);
    }
    if (this.height === undefined) {
      throw new Error('Undefined height for node ' + this.key);
    }

    const leftH = this.left ? this.left.height : 0;
    const rightH = this.right ? this.right.height : 0;

    if (this.height !== 1 + Math.max(leftH, rightH)) {
      throw new Error('Height constraint failed for node ' + this.key);
    }
    if (this.left) {
      this.left.checkHeightCorrect();
    }
    if (this.right) {
      this.right.checkHeightCorrect();
    }
  }

  /**
   * Return the balance factor
   */
  balanceFactor() {
    const leftH = this.left ? this.left.height : 0;
    const rightH = this.right ? this.right.height : 0;
    return leftH - rightH;
  }

  /**
   * Check that the balance factors are all between -1 and 1
   */
  checkBalanceFactors() {
    if (Math.abs(this.balanceFactor()) > 1) {
      throw new Error('Tree is unbalanced at node ' + this.key);
    }

    if (this.left) {
      this.left.checkBalanceFactors();
    }
    if (this.right) {
      this.right.checkBalanceFactors();
    }
  }

  /**
   * When checking if the BST conditions are met, also check that the heights are correct
   * and the tree is balanced
   */
  checkIsAVLTree() {
    super.checkIsBST();
    this.checkHeightCorrect();
    this.checkBalanceFactors();
  }

  /**
   * Perform a right rotation of the tree if possible
   * and return the root of the resulting tree
   * The resulting tree's nodes' heights are also updated
   */
  rightRotation() {
    const q = this;
    const p = this.left;

    if (!p) return q; // No change

    const b = p.right;

    // Alter tree structure
    if (q.parent) {
      p.parent = q.parent;
      if (q.parent.left === q) q.parent.left = p;
      else q.parent.right = p;
    } else {
      p.parent = null;
    }
    p.right = q;
    q.parent = p;
    q.left = b;
    if (b) {
      b.parent = q;
    }

    // Update heights
    const ah = p.left ? p.left.height : 0;
    const bh = b ? b.height : 0;
    const ch = q.right ? q.right.height : 0;
    q.height = Math.max(bh, ch) + 1;
    p.height = Math.max(ah, q.height) + 1;

    return p;
  }

  /**
   * Perform a left rotation of the tree if possible
   * and return the root of the resulting tree
   * The resulting tree's nodes' heights are also updated
   */
  leftRotation() {
    const p = this;
    const q = this.right;

    if (!q) {
      return this;
    } // No change

    const b = q.left;

    // Alter tree structure
    if (p.parent) {
      q.parent = p.parent;
      if (p.parent.left === p) p.parent.left = q;
      else p.parent.right = q;
    } else {
      q.parent = null;
    }
    q.left = p;
    p.parent = q;
    p.right = b;
    if (b) {
      b.parent = p;
    }

    // Update heights
    const ah = p.left ? p.left.height : 0;
    const bh = b ? b.height : 0;
    const ch = q.right ? q.right.height : 0;
    p.height = Math.max(ah, bh) + 1;
    q.height = Math.max(ch, p.height) + 1;

    return q;
  }

  /**
   * Modify the tree if its right subtree is too small compared to the left
   * Return the new root if any
   */
  rightTooSmall() {
    if (this.balanceFactor() <= 1) return this; // Right is not too small, don't change

    if (this.left.balanceFactor() < 0) this.left.leftRotation();

    return this.rightRotation();
  }

  /**
   * Modify the tree if its left subtree is too small compared to the right
   * Return the new root if any
   */
  leftTooSmall() {
    if (this.balanceFactor() >= -1) {
      return this;
    } // Left is not too small, don't change

    if (this.right.balanceFactor() > 0) this.right.rightRotation();

    return this.leftRotation();
  }

  /**
   * Rebalance the tree along the given path.
   * - The path is given reversed (as it was calculated in the insert and delete functions).
   * - Returns the new root of the tree
   * - Of course, the first element of the path must be the root of the tree
   */
  rebalanceAlongPath(path) {
    let newRoot = this;
    let rotated;
    let i;

    if (!Object.hasOwn(this, 'key')) {
      delete this.height;
      return this;
    } // Empty tree

    // Rebalance the tree and update all heights
    for (i = path.length - 1; i >= 0; i -= 1) {
      path[i].height =
        1 +
        Math.max(
          path[i].left ? path[i].left.height : 0,
          path[i].right ? path[i].right.height : 0,
        );

      if (path[i].balanceFactor() > 1) {
        rotated = path[i].rightTooSmall();
        if (i === 0) newRoot = rotated;
      }

      if (path[i].balanceFactor() < -1) {
        rotated = path[i].leftTooSmall();
        if (i === 0) newRoot = rotated;
      }
    }

    return newRoot;
  }

  /**
   * Insert a [key, value] pair in the tree while maintaining the AVL tree height constraint
   * - Return a pointer to the root node, which may have changed
   */
  insert(key, value) {
    const insertPath = [];
    let currentNode: _AVLTree = this;

    // Empty tree, insert as root
    if (!Object.hasOwn(this, 'key')) {
      this.key = key;
      this.data.push(value);
      this.height = 1;
      return this;
    }

    // Insert new leaf at the right place
    while (true) {
      // Same key: no change in the tree structure
      if (currentNode.compareKeys(currentNode.key, key) === 0) {
        if (currentNode.unique) {
          const err: any = new Error(
            `Can't insert key ${key}, it violates the unique constraint`,
          );
          err.key = key;
          err.errorType = 'uniqueViolated';
          throw err;
        } else {
          currentNode.data.push(value);
        }
        return this;
      }

      insertPath.push(currentNode);

      if (currentNode.compareKeys(key, currentNode.key) < 0) {
        if (!currentNode.left) {
          insertPath.push(
            currentNode.createLeftChild({ key: key, value: value }),
          );
          break;
        } else {
          currentNode = currentNode.left;
        }
      } else {
        if (!currentNode.right) {
          insertPath.push(
            currentNode.createRightChild({ key: key, value: value }),
          );
          break;
        } else {
          currentNode = currentNode.right;
        }
      }
    }

    return this.rebalanceAlongPath(insertPath);
  }

  /**
   * Delete a key or just a value and return the new root of the tree
   * @param {Key} key
   * @param {Value} value Optional. If not set, the whole key is deleted. If set, only this value is deleted
   */
  delete(key, value) {
    const newData = [];
    let replaceWith;
    let currentNode: _AVLTree = this;
    const deletePath = [];

    if (!Object.hasOwn(this, 'key')) return this; // Empty tree

    // Either no match is found and the function will return from within the loop
    // Or a match is found and deletePath will contain the path from the root to the node to delete after the loop
    while (true) {
      if (currentNode.compareKeys(key, currentNode.key) === 0) {
        break;
      }

      deletePath.push(currentNode);

      if (currentNode.compareKeys(key, currentNode.key) < 0) {
        if (currentNode.left) {
          currentNode = currentNode.left;
        } else return this; // Key not found, no modification
      } else {
        // currentNode.compareKeys(key, currentNode.key) is > 0
        if (currentNode.right) {
          currentNode = currentNode.right;
        } else return this; // Key not found, no modification
      }
    }

    // Delete only a value (no tree modification)
    if (currentNode.data.length > 1 && value !== undefined) {
      currentNode.data.forEach(function (d) {
        if (!currentNode.checkValueEquality(d, value)) newData.push(d);
      });
      currentNode.data = newData;
      return this;
    }

    // Delete a whole node

    // Leaf
    if (!currentNode.left && !currentNode.right) {
      if (currentNode === this) {
        // This leaf is also the root
        delete currentNode.key;
        currentNode.data = [];
        delete currentNode.height;
        return this;
      } else {
        if (currentNode.parent.left === currentNode)
          currentNode.parent.left = null;
        else currentNode.parent.right = null;
        return this.rebalanceAlongPath(deletePath);
      }
    }

    // Node with only one child
    if (!currentNode.left || !currentNode.right) {
      replaceWith = currentNode.left ? currentNode.left : currentNode.right;

      if (currentNode === this) {
        // This node is also the root
        replaceWith.parent = null;
        return replaceWith; // height of replaceWith is necessarily 1 because the tree was balanced before deletion
      } else {
        if (currentNode.parent.left === currentNode) {
          currentNode.parent.left = replaceWith;
          replaceWith.parent = currentNode.parent;
        } else {
          currentNode.parent.right = replaceWith;
          replaceWith.parent = currentNode.parent;
        }

        return this.rebalanceAlongPath(deletePath);
      }
    }

    // Node with two children
    // Use the in-order predecessor (no need to randomize since we actively rebalance)
    deletePath.push(currentNode);
    replaceWith = currentNode.left;

    // Special case: the in-order predecessor is right below the node to delete
    if (!replaceWith.right) {
      currentNode.key = replaceWith.key;
      currentNode.data = replaceWith.data;
      currentNode.left = replaceWith.left;
      if (replaceWith.left) {
        replaceWith.left.parent = currentNode;
      }
      return this.rebalanceAlongPath(deletePath);
    }

    // After this loop, replaceWith is the right-most leaf in the left subtree
    // and deletePath the path from the root (inclusive) to replaceWith (exclusive)
    while (true) {
      if (replaceWith.right) {
        deletePath.push(replaceWith);
        replaceWith = replaceWith.right;
      } else break;
    }

    currentNode.key = replaceWith.key;
    currentNode.data = replaceWith.data;

    replaceWith.parent.right = replaceWith.left;
    if (replaceWith.left) replaceWith.left.parent = replaceWith.parent;

    return this.rebalanceAlongPath(deletePath);
  }
}

/**
 * Self-balancing binary search tree using the AVL implementation
 */
export class AVLTree {
  tree: _AVLTree;

  /** Keep a pointer to the internal tree constructor for testing purposes
   */
  static _AVLTree = _AVLTree;

  /**
   * We can't use a direct pointer to the root node (as in the simple binary search tree)
   * as the root will change during tree rotations
   * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
   * @param {Function} options.compareKeys Initialize this BST's compareKeys
   */
  constructor(options = {}) {
    this.tree = new _AVLTree(options);
  }

  checkIsAVLTree() {
    this.tree.checkIsAVLTree();
  }

  /** Insert in the internal tree, update the pointer to the root if needed */
  insert(key, value = undefined) {
    const newTree = this.tree.insert(key, value);

    // If newTree is undefined, that means its structure was not modified
    if (newTree) {
      this.tree = newTree;
    }
  }

  /** Delete a value */
  delete(key, value = undefined) {
    const newTree = this.tree.delete(key, value);

    // If newTree is undefined, that means its structure was not modified
    if (newTree) {
      this.tree = newTree;
    }
  }

  /**
   * Get number of keys inserted
   */
  getNumberOfKeys() {
    return this.tree.getNumberOfKeys();
  }

  /**
   * Search for all data corresponding to a key
   */
  search(key) {
    return this.tree.search(key);
  }

  /**
   * Get all data for a key between bounds
   * Return it in key order
   * @param {Object} query Mongo-style query where keys are $lt, $lte, $gt or $gte (other keys are not considered)
   * @param {Functions} lbm/ubm matching functions calculated at the first recursive step
   */
  betweenBounds(query, lbm = undefined, ubm = undefined) {
    return this.tree.betweenBounds(query, lbm, ubm);
  }

  /**
   * Pretty print a tree
   * @param {Boolean} printData To print the nodes' data along with the key
   */
  prettyPrint(printData: boolean, spacing) {
    this.tree.prettyPrint(printData, spacing);
  }

  /**
   * Execute a function on every node of the tree, in key order
   * - recursive/depth-first
   * @param {Function} fn Signature: node. Most useful will probably be node.key and node.data
   */
  executeOnEveryNode(fn) {
    this.tree.executeOnEveryNode(fn);
  }
}
