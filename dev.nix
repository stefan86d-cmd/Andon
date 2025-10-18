
{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.pnpm
    firebase-tools
    git-filter-repo
  ];
}
