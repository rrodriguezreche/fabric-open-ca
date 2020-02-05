# !/bin/bash

# Message with red color
function printError() {
    >&2 echo -e "\e[1;91mERROR:\e[0m $*"
}

function checkFatalError() {
  if [ "$1" -ne "0" ]; then
    >&2 echo "at function ${FUNCNAME[1]}, line ${BASH_LINENO[0]}"
    printError "Operation returned code $1 instead of 0. Cannot continue"
  fi
}

# Print a message surrounded by #, separating it from the rest of the output
function printSection() {
  local l=`printf '#%.s' $(eval "echo {1.."$((${#1} + 20))"}")`
	printf "\n$l\n##        $1        ##\n$l\n\n"
}
