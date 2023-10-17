import dataclasses
import json
import os
import shutil
import typing


class Operations(typing.TypedDict):
    delete: list[str]
    copy: dict[str, str]


@dataclasses.dataclass(frozen=True, kw_only=True)
class Handlers:
    patches_root_directory: str
    source_root_directory: str

    def handle(self, operation: str, commands: dict[str, str] | list[str]) -> None:
        handled_operations = self.__class__.__dict__.get(operation, None)
        if handled_operations is None:
            raise ValueError(f"Unknown operation: {operation}")
        handled_operations(self, commands)

    def delete(self, commands: list[str]) -> None:
        for command in commands:
            if os.path.isdir(os.path.join(self.source_root_directory, command)):
                shutil.rmtree(
                    os.path.join(self.source_root_directory, command),
                    ignore_errors=True
                )
            else:
                os.remove(os.path.join(self.source_root_directory, command))

    def copy(self, commands: dict[str, str]) -> None:
        for source, target in commands.items():
            if os.path.isdir(os.path.join(self.patches_root_directory, source)):
                shutil.copytree(
                    os.path.join(self.patches_root_directory, source),
                    os.path.join(self.source_root_directory, target)
                )
            else:
                shutil.copy(
                    os.path.join(self.patches_root_directory, source),
                    os.path.join(self.source_root_directory, target)
                )


def open_patch_operations_file(path: str) -> Operations:
    with open(path, "r", encoding="utf-8") as operations_file:
        return json.load(operations_file)


if __name__ == "__main__":
    source_root = os.environ.get("TARGET_DIRECTORY", None)
    if source_root is None:
        raise ValueError("TARGET_DIRECTORY is not set")
    patches_root = os.environ.get("PATCHES_DIRECTORY", None)
    if patches_root is None:
        raise ValueError("PATCHES_DIRECTORY is not set")

    available_handlers = Handlers(
        patches_root_directory=os.path.join(os.getcwd(), patches_root),
        source_root_directory=os.path.join(os.getcwd(), source_root)
    )
    operations = open_patch_operations_file("patches/operations.json")
    for supported_operation in Operations.__annotations__.keys():
        if present_operations := operations.get(supported_operation, {}):
            available_handlers.handle(supported_operation, present_operations)  # type: ignore
