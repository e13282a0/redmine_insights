Redmine::Plugin.register :redmine_performance_charts do
  name 'Redmine Performance Charts plugin'
  author 'rc'
  description 'This is a plugin for Redmine'
  version '0.0.2'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'
  menu :application_menu, :performance, { controller: 'performance', action: 'index' }, caption: 'Performance'
  #permission :performancedetail, { performance_charts: [:index ] }, public: true
  permission :performance, { :performance => [:index, :project] }, :public => true
  menu :project_menu, :performance, { controller: 'performance', action: 'project' }, caption: 'Performance', :param => :project_id
end
