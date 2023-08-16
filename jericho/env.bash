alias start-server='cd $BIBLI/jericho/app;  poetry run uvicorn app.main:app --reload'

alias pg-jericho-local='psql postgres -d jericho'
