alias start-server='cd $BIBLI/jericho/app;  poetry run uvicorn main:app --reload'

alias pg-jericho-local='psql postgres -d jericho'

alias pr-pytest='cd $BIBLI/jericho/app; poetry run pytest'
alias pr-pylint='cd $BIBLI/jericho/app; poetry run pylint .'
alias pr-isort='cd $BIBLI/jericho/app; poetry run isort .'
alias pr-black='cd $BIBLI/jericho/app; poetry run black .'
alias pr-flake8='cd $BIBLI/jericho/app; poetry run flake8 .'

alias pr-alembic-upgrade='cd $BIBLI/jericho/app/src/db; poetry run alembic upgrade head'
alias pr-alembic-revision='cd $BIBLI/jericho/app/src/db; poetry run alembic revision --autogenerate -m "User Bio"

