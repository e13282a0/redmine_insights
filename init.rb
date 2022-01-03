Redmine::Plugin.register :redmine_insights do
  name 'Redmine performance insights plugin'
  author 'rc'
  description 'Performance insights'
  version '0.0.2'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'
  #menu :application_menu, :performance, { controller: 'performance', action: 'index' }, caption: 'Insights'
  permission :performance, { :performance => [:index, :project] }, :public => true
  menu :project_menu, :performance, { controller: 'performance', action: 'project' }, caption: 'Insights', :param => :project_id
end
