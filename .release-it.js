module.exports = {
  git: {
    commitMessage: 'chore(release): v${version}',
    tagName: 'v${version}',
  },
  npm: {
    publish: false,
  },
  github: {
    release: true,
    releaseName: 'v${version}',
  },
  plugins: {
    '@release-it/conventional-changelog': {
      infile: 'CHANGELOG.md',
      header: '# Changelog',
      preset: {
        name: 'conventionalcommits',
        types: [
          { type: 'feat', section: 'New Features' },
          { type: 'perf', section: 'Performance Improvements' },
          { type: 'fix', section: 'Bug Fixes' },
          { type: 'chore', section: 'Internal Updates' },
          { type: 'refactor', section: 'Internal Updates' },
        ],
      },
      writerOpts: {
        commitGroupsSort: (a, b) => {
          const sections = [
            'New Features',
            'Performance Improvements',
            'Bug Fixes',
            'Internal Updates',
          ];
          return sections.indexOf(a.title) - sections.indexOf(b.title);
        },
        commitsSort: 'header',
      },
    },
  },
  hooks: {
    'after:release': 'pnpm genversion',
  },
};
