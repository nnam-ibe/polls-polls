type CenterProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Center(props: CenterProps) {
  const { className = "", children } = props;

  return (
    <div
      className={`flex flex-col justify-center padding 1rem max-w-screen-md ml-auto mr-auto min-h-[--content-height] ${className}`}
    >
      {children}
    </div>
  );
}
