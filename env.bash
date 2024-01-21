if [ -n "$BASH_VERSION" ]; then
    BIBLI=$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd -P)
elif [ -n "$ZSH_VERSION" ]; then
    BIBLI=$(cd "$(dirname "${(%):-%N}")"  >/dev/null && pwd -P)
else
    echo "Unsupported shell, using an undefined value for variable $BIBLI which may cause unexpected behavior"
fi
export BIBLI

source $BIBLI/jericho/env.bash
source $BIBLI/sasquatch/env.bash
