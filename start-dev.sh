#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
export PATH="/Users/brunswick/.nvm/versions/node/v24.14.0/bin:$PATH"
npm run dev
