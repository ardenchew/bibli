alias start-server='cd $BIBLI/jericho/app;  poetry run uvicorn main:app --reload'

alias pg-jericho-local='psql postgres -d jericho'

alias pr-pytest='cd $BIBLI/jericho/app; poetry run pytest'
alias pr-pylint='cd $BIBLI/jericho/app; poetry run pylint --recursive=y --ignore-docstrings=y --disable=C0116 --disable=C0115 --disable=C0114 ./'
alias pr-isort='cd $BIBLI/jericho/app; poetry run isort .'
alias pr-black='cd $BIBLI/jericho/app; poetry run black .'
alias pr-flake8='cd $BIBLI/jericho/app; poetry run flake8 .'

